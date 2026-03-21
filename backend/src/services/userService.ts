import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { formatUserResponse } from './authService';
import { UpdateProfileInput } from '../validators/userValidators';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('使用者不存在', 404);
  }

  return formatUserResponse(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  // Build update data, mapping snake_case input to camelCase Prisma fields
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.persona !== undefined) updateData.persona = input.persona;
  if (input.ai_engine !== undefined) updateData.aiEngine = input.ai_engine;
  if (input.monthly_budget !== undefined) updateData.monthlyBudget = input.monthly_budget;
  if (input.ai_instructions !== undefined) updateData.aiInstructions = input.ai_instructions;
  if (input.language !== undefined) updateData.language = input.language;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return formatUserResponse(user);
}
