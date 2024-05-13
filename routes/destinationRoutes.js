const express = require('express')

const destinationController = require('../controllers/destinationController')

const router = express.Router()
// get list 
router.get('/', destinationController.getDestinationList)
router.get('/:id', destinationController.getDestinationDetail)
// create Destination
router.post('/', destinationController.createDestination)
// update Destination
router.put('/:id', destinationController.updateDestination)
// delete Destination
router.delete('/:id', destinationController.deleteDestination)

module.exports = router