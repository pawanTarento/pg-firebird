const addFailoverConfigStateRecord = (req, res) => {
    return res.status(200).json({message: "Hello, World! from addFailoverConfigStateRecord"});

}

const modifyFailoverConfigStateRecord = (req, res) => {
    return res.status(200).json({message: "Hello, World! from modifyFailoverConfigStateRecord"});

}

const deleteFailoverConfigStateRecord = (req, res) => {
    return res.status(200).json({message: "Hello, World! from deleteFailoverConfigStateRecord"});

}

const AllFailoverConfigStateRecords = (req, res) => {
    return res.status(200).json({message: "Hello, World! from AllFailoverConfigStateRecords"});

}

const getSingleFailoverConfigStateRecord = (req, res) => {
    return res.status(200).json({message: "Hello, World! from getSingleFailoverConfigStateRecord"});

}

module.exports = {
    addFailoverConfigStateRecord,
    modifyFailoverConfigStateRecord,
    deleteFailoverConfigStateRecord,
    AllFailoverConfigStateRecords,
    getSingleFailoverConfigStateRecord
}
