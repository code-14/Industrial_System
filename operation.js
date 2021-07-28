

/*           ################################################## INPUT DATA  ##########################################################
data = {

    "Plants": [

        "PlantA",

        "PlantB",

        "PlantC",

        "PlantD"

    ],

    "Equipments": [

        "Equipment1",

        "Equipment2",

        "Equipment3",

        "Equipment4"

    ],

    "Sensors": [

        "Sensor1",

        "Sensor2",

        "Sensor3",

        "Sensor4",

        "Sensor5",

        "Sensor6"

    ],

    "PlantsMapping": {

        "PlantA": [

            "Equipment1",

            "Equipment3",

        ],

        "PlantB": [

            "Equipment2",

            "Equipment4"

        ]

    },

    "EquipmentsMapping": {

        "Equipment1": [

            {

                "_id": "Sensor1",

                "start_time": "10:00",

                "end_time": "15:00"

            },

            {

                "_id": "Sensor2",

                "start_time": "11:00",

                "end_time": "14:30"

            },

            {

                "_id": "Sensor3",

                "start_time": "03:45",

                "end_time": "21:00"

            }

        ],

        "Equipment2": [

            {

                "_id": "Sensor2",

                "start_time": "11:00",

                "end_time": "12:00"

            },

            {

                "_id": "Sensor4",

                "start_time": "07:00",

                "end_time": "14:30"

            },

            {

                "_id": "Sensor5",

                "start_time": "13:45",

                "end_time": "20:45"

            },

            {

                "_id": "Sensor6",

                "start_time": "19:45",

                "end_time": "20:45"

            }

        ],

        "Equipment3": [

            {

                "_id": "Sensor1",

                "start_time": "01:00",

                "end_time": "18:00"

            },

            {

                "_id": "Sensor3",

                "start_time": "10:10",

                "end_time": "17:30"

            },

            {

                "_id": "Sensor4",

                "start_time": "10:05",

                "end_time": "21:30"

            }

        ],

        "Equipment4": [

            {

                "_id": "Sensor2",

                "start_time": "14:35",

                "end_time": "19:00"

            },

            {

                "_id": "Sensor4",

                "start_time": "03:05",

                "end_time": "14:30"

            },

            {

                "_id": "Sensor5",

                "start_time": "03:05",

                "end_time": "14:30"

            }

        ]

    }


    query: {

        equipment: "Equipment4",

        start_time: "01:00",

        end_time: "20:40",

    }

}
*/

 
/*    ################################################## DATA STORED IN THIS FORMAT  ##########################################################

 {

     "sensor": "Sensor2",

     "start_time": "14:35",

    "end_time": "19:00",

     equipment: "Equipment4",

     plant: "PlantB" 

 }
 */

let async = require("async");

var moment = require('moment-timezone');

var MongoClient = require('mongodb').MongoClient;  //Data is stored in mongodb

let data = require('./data.json');           //input file(also contains query )

 

start();

 
//converts data file obtained into object
function passOn(obj) {

    return function (next) {

        next(null, obj);

    };

}

 
//start function
function start() {

    async.waterfall([

        passOn(data),

        setDb,

        store,

        get_all_sensors,

    ], function (err, resp) {

        var result = new Object();

        for (let i in resp) {

            console.log(`

                Sensor: ${resp[i]._id},

                start_time: ${moment(new Date(resp[i].start_time)).format("HH:MM")},

                end_time: ${moment(new Date(resp[i].end_time)).format("HH:MM")},

            `);   //display the end result
            var timePair = new Array();
            timePair.push(start_time);
            timePair.push(end_time);
            result[Sensor] = timePair;  //Result also stored in dicionary for further use

        }

    });

}

 

/**

 * Function to establish db connection

 * @param {*} obj 

 * @param {*} next 

 */

 function setDb(obj, next) {

    const server = 'localhost:27017';

    const database = 'Testing';

    const reconn = { reconnectTries: 100, reconnectInterval: 10000, useNewUrlParser: true };

    MongoClient.connect(`mongodb://${server}/${database}`, reconn, function (err, d) {

        if (err)

            return next(err);

        obj.db = d.db();

        return next(null, obj);

    });

}

 

function store(obj, next) {

    let equipmentToPlant = {};

    let sensorToEquipment = [];

    //Equipment to plant mapping
    for (let i in obj.PlantsMapping) {

        obj.PlantsMapping[i].forEach(equipment => {

            equipmentToPlant[equipment] = i;

        });

    }
    // Equipment to plant to sensor mapping
    for (let i in obj.EquipmentsMapping) {

        obj.EquipmentsMapping[i].forEach(sensor => {

            let foo = { ...sensor };

            foo.equipment = i;

            foo.plant = equipmentToPlant[i];

            foo.sensor = foo._id;

            foo.start_time = new Date(`${moment().format("YYYY-MM-DD")}T${foo.start_time}`);

            foo.end_time = new Date(`${moment().format("YYYY-MM-DD")}T${foo.end_time}`);

            delete foo._id;

            sensorToEquipment.push(foo);

        });

    }

    //storing this equipment to plant to sensor mapping with name sensor_allocation
    obj.db.collection("sensor_allocation").insertMany(sensorToEquipment, function(err, resp) {

        next(null, obj);

    });

}

 
//This function checks for the sensors in the equipment their time lies between the time mentioned in query
function get_all_sensors(obj, next) {

    obj.db.collection("sensor_allocation").aggregate([

        {$match:{equipment: obj.query.equipment, 

            start_time:{$gte: new Date(`${moment().format("YYYY-MM-DD")}T${obj.query.start_time}`)},

            end_time:{$lte: new Date(`${moment().format("YYYY-MM-DD")}T${obj.query.end_time}`)}}},

        {$group: {_id:"$sensor", start_time: {$push: "$start_time"}, end_time: {$push: "$end_time"}}}

    ]).toArray(function(err, data) {

        next(null, data);

    });

}