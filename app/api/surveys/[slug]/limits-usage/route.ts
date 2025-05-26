import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
	req: Request,
	{ params }: { params: { slug: string } }
) {
	try {
		const slug = params.slug;
		if (!slug) {
			return NextResponse.json(
				{ error: 'Missing survey slug' },
				{ status: 400 }
			);
		}

		// Get the survey by slug
		const survey = await prisma.surveys.findUnique({
			where: { slug },
			select: {
				id: true,
				user_id: true,
				total_responses: true,
				total_responses_ai: true,
			},
		});

		if (!survey) {
			return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
		}

		// Get the owner's subscription
		const userSub = await prisma.user_subscriptions.findFirst({
			where: { user_id: survey.user_id },
			select: { price_id: true },
		});

		// Get total AI responses for all surveys by this user
		const allSurveys = await prisma.surveys.findMany({
			where: { user_id: survey.user_id },
			select: { total_responses_ai: true },
		});
		const totalResponsesAIAllSurveys = allSurveys.reduce(
			(sum: number, s: { total_responses_ai: any }) =>
				sum + (s.total_responses_ai ? Number(s.total_responses_ai) : 0),
			0
		);

		// Default to plan 1 if not found
		const priceId = userSub?.price_id || 'free';

		// Get the plan features
		const plan = await prisma.subscription_prices.findUnique({
			where: { id: priceId },
			select: { features: true },
		});

		const features = plan?.features || {};
		// If features is a JSON object, get max_responses, else default to 100
		let maxResponses = 10;
		let maxChatResponses = 10;
		if (
			features &&
			typeof features === 'object' &&
			'max_responses' in features &&
			'max_chat_responses' in features
		) {
			maxResponses = features.max_responses;
			maxChatResponses = features.max_chat_responses;
		}
		return NextResponse.json({
			totalResponses: Number(survey.total_responses),
			totalResponsesAI: Number(totalResponsesAIAllSurveys),
			surveyMaxResponses: Number(maxResponses),
			surveyMaxChatResponses: Number(maxChatResponses),
		});
	} catch (error) {
		console.error('Error fetching survey usage limits:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch survey usage limits' },
			{ status: 500 }
		);
	}
}
