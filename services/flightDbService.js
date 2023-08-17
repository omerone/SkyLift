const flightModel = require("../models/flightModel");
const Flight = require("../models/flightModel");

/* CREATE */
const createFlight = async data => {
    const { special_id,title, price, company, origin, destination, departTime, estimatedTimeOfArrival } = data;
    const newFlight = new Flight({ special_id,title, price, company, origin, destination, departTime, estimatedTimeOfArrival });
    return await newFlight.save();
};

/* READ - List */
const getFlights = async () => await Flight.find({});//TODO: in future, add a limiter for pagination purposes.the name of the paramater: numOfFlights

/* READ - popular Deals */
const getPopularFlights = async () => await Flight.find({isPopular:true})

/**READ- 1 entry
 * 
 * @param {*} dbId 
 * @returns db.collection==Flight 's entry with id==dbId.
 * To be used mainly by updateFlightData
 */
const getFlightById = async dbId => await Flight.findById({_id:dbId});

/*TODO: TEST THIS FUNCTION! */
const getFlightsByIdArr = async arr=> arr.length ? await Flight.findById({_id:{$in:arr}}) : [];

/**
 * 
 * @param {*} filterOBj 
 * @returns array of Flights with matching key-val pairs from filterOBj.
 * filter obj need to have key-val pairs as specified in ../models/flightModel.js, otherwise will not work.
 */
const getFlightsByFilter = async (filterOBj = {},) => await Flight.find({ ...filterOBj });

const tommorow =86400*1000;
const get_flights_from_a_to_b = async (origin, destination,
     desired_depart_time = new Date(Date.now()), desired_arrive_time = (new Date(Date.now()+tommorow))) => {
    const directFlight = await Flight.aggregate([{ $match: 
        { origin: a._id, destination: b._id,
            departTime: { $gte: desired_depart_time},estimatedTimeOfArrival: { $lte: new Date(desired_depart_time+tommorow)} } }]);
    const departing_from_a = await Flight.aggregate([{ $match: { origin: a._id } },
    { $match: { departTime: { $gte: desired_depart_time} } }])
    const arriving_to_b = await Flight.aggregate([{ $match: { destination: b._id } },
    { $match: { departure: { $gte: desired_depart_time ? desired_depart_time : Date.now() } } }])
}



/**UPDATE
 * 
 * @param {*} dbIdentifier 
 * @param {*} newData 
 * @returns the updated entry with id ==  dbIdentifier in the flights collection, after the newData has been written into it
 */
const updateFlightData = async (dbIdentifier, newData) => {
    const flightToBeUpdated = await getFlightById(dbIdentifier);
    if (!flightToBeUpdated) {
        return null;//Maybe throwing an error is better?
    }
    Object.keys(newData).forEach(propertyName => flightToBeUpdated[propertyName] = newData[propertyName]);
    await flightToBeUpdated.save();
    return flightToBeUpdated;
};

/* DELETE */
const deleteFlight = async flightId => {
    const flightToDeleted = await Flight.findById(flightId);
    if (!flightId) {
        return null;//Maybe throwing an error is better?
    }
    await flightToDeleted.deleteOne();
    return flightToDeleted;
};

module.exports = {
    createFlight,//Create
    getFlights,//Read
    getFlightById,//Read
    getPopularFlights,//READ
    getFlightsByFilter,//Read
    updateFlightData,//Update
    deleteFlight,//Delete
    getFlightsByIdArr,//READ
};