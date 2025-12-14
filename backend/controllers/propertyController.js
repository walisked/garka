import LandProperty from '../models/LandProperty.js';
import Agent from '../models/Agent.js';
import { success, failure } from '../utils/response.js';

export const createProperty = async (req, res) => {
  try {
    const agent = await Agent.findOne({ user: req.user.id });
    if (!agent) return failure(res, 'Agent profile not found', 404);

    const property = await LandProperty.create({
      ...req.body,
      agent: agent._id,
      listedBy: req.user.id
    });

    return success(res, { property }, 'Property created successfully');
  } catch (error) {
    return failure(res, 'Failed to create property', 500);
  }
};

export const listProperties = async (req, res) => {
  try {
    const properties = await LandProperty.find({ status: 'AVAILABLE' }).populate('agent', 'user organizationName');
    return success(res, { properties }, 'Properties retrieved');
  } catch (error) {
    return failure(res, 'Failed to list properties', 500);
  }
};
