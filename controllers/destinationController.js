const DestinationModel = require('../models/destinationModel')

const getDestinationList = async (req, res) => {
    const { Keyword, Province, Type } = req.query
    try {
        const categories = await DestinationModel.getDestination(Keyword, Province, Type)
        res.status(200).json(categories)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
const getDestinationDetail = async (req, res) => {
    const { id } = req.params
    try {
        const categories = await DestinationModel.getDestinationDetail(id)
        res.status(200).json(categories)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const createDestination = async (req, res) => {
    const { name, latitude, longitude, time_start, time_end, price, experience, image, province } = req.body
    try {
        const resp = await DestinationModel.createDestinationDB(name, latitude, longitude, time_start, time_end, price, experience, image, province)
        if (resp.status === 200) {
            res.status(200).json({ status: 200 })
        }
        else {
            res.status(200).json({ status: 210 })
        }
    } catch (err) {
        console.log("🚀 ~ createDestination ~ err:", err)
        res.status(500).json({ message: err.message })
    }
}
const updateDestination = async (req, res) => {
    const { id } = req.params
    const { name, image } = req.body
    try {
        const resp = await DestinationModel.updateDestinationInDb(id, name, image)
        if (resp.status === 200) {
            res.status(200).json({ status: 200 })
        }
        else {
            res.status(200).json({ status: 210 })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
const deleteDestination = async (req, res) => {
    const id = req.params.id
    try {
        const categories = await DestinationModel.deleteDestinationInDb(id)
        res.status(200).json(categories)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    getDestinationList,
    createDestination,
    getDestinationDetail,
    deleteDestination,
    updateDestination,
}