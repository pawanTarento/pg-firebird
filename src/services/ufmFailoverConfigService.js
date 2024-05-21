
const addFailoverConfigRecord = (req, res) => {
    return res.status(200).json({message: "Hello, World! from addFailoverConfigRecord"});
}

const modifyFailoverConfigRecord = (req, res) => {
    return res.status(200).json({message: "Hello, World! from modifyFailoverConfigRecord"});

}

const deleteFailoverConfigRecord = (req, res) => {
    return res.status(200).json({message: "Hello, World! from deleteFailoverConfigRecord"});

}

const getAllFailoverConfigRecords = (req, res) => {
    return res.status(200).json({message: "Hello, World! from getAllFailoverConfigRecords"});

}

const getSingleFailoverConfigRecord = (req, res) => {
    return res.status(200).json({message: "Hello, World! from getSingleFailoverConfigRecord"});

}

module.exports = {
    addFailoverConfigRecord,
    modifyFailoverConfigRecord,
    deleteFailoverConfigRecord,
    getAllFailoverConfigRecords,
    getSingleFailoverConfigRecord
}
