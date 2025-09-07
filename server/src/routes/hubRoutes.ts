// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import { Router } from 'express';
import DistributionHub from '../models/DistributionHub';
import { HubTypes } from '../models/HubTypes';

const router = Router();

// GET /api/hubs - Get all distribution hubs
router.get('/', async (req, res) => {
  try {
    const hubs = await DistributionHub.find().select('_id hubName hubLocation');
    res.status(200).json({
      hubs: hubs,
    });
  } catch (error) {
    console.error('Error fetching hubs:', error);
    res.status(500).json({
      message: 'Failed to fetch distribution hubs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/hubs - Create a new distribution hub
router.post('/', async (req, res) => {
  try {
    const { hubName, hubLocation } = req.body;

    // Validate required fields
    if (!hubName || !hubLocation) {
      return res.status(400).json({
        message: 'Hub name and location are required',
      });
    }

    // Validate hub name is a valid enum value
    if (!Object.values(HubTypes).includes(hubName)) {
      return res.status(400).json({
        message: `Invalid hub name. Must be one of: ${Object.values(HubTypes).join(', ')}`,
      });
    }

    // Check if hub already exists
    const existingHub = await DistributionHub.findOne({ hubName });
    if (existingHub) {
      return res.status(409).json({
        message: 'Hub with this name already exists',
      });
    }

    // Create new hub
    const hub = await DistributionHub.create({
      hubName,
      hubLocation,
    });

    res.status(201).json({
      message: 'Distribution hub created successfully',
      hub: hub,
    });
  } catch (error) {
    console.error('Error creating hub:', error);
    res.status(500).json({
      message: 'Failed to create distribution hub',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/hubs/:id - Get a specific hub by ID
router.get('/:id', async (req, res) => {
  try {
    const hub = await DistributionHub.findById(req.params.id);
    if (!hub) {
      return res.status(404).json({
        message: 'Distribution hub not found',
      });
    }

    res.status(200).json({
      message: 'Distribution hub retrieved successfully',
      hub: hub,
    });
  } catch (error) {
    console.error('Error fetching hub:', error);
    res.status(500).json({
      message: 'Failed to fetch distribution hub',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT /api/hubs/:id - Update a distribution hub
router.put('/:id', async (req, res) => {
  try {
    const { hubName, hubLocation } = req.body;

    // Validate hub name if provided
    if (hubName && !Object.values(HubTypes).includes(hubName)) {
      return res.status(400).json({
        message: `Invalid hub name. Must be one of: ${Object.values(HubTypes).join(', ')}`,
      });
    }

    const hub = await DistributionHub.findByIdAndUpdate(
      req.params.id,
      { ...(hubName && { hubName }), ...(hubLocation && { hubLocation }) },
      { new: true, runValidators: true },
    );

    if (!hub) {
      return res.status(404).json({
        message: 'Distribution hub not found',
      });
    }

    res.status(200).json({
      message: 'Distribution hub updated successfully',
      hub: hub,
    });
  } catch (error) {
    console.error('Error updating hub:', error);
    res.status(500).json({
      message: 'Failed to update distribution hub',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/hubs/:id - Delete a distribution hub
router.delete('/:id', async (req, res) => {
  try {
    const hub = await DistributionHub.findByIdAndDelete(req.params.id);
    if (!hub) {
      return res.status(404).json({
        message: 'Distribution hub not found',
      });
    }

    res.status(200).json({
      message: 'Distribution hub deleted successfully',
      hub: hub,
    });
  } catch (error) {
    console.error('Error deleting hub:', error);
    res.status(500).json({
      message: 'Failed to delete distribution hub',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
