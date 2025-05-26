import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const { pathname } = new URL(request.url);
		const slug = pathname.split('/').pop();
		if (!slug) {
			return NextResponse.json(
				{ error: 'Missing survey slug' },
				{ status: 400 }
			);
		}
		const survey = await prisma.surveys.findUnique({
			where: { slug },
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

		// Default to price 1 if not found
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
		return NextResponse.json(
			{
				survey: survey,
				limits: {
					totalResponses: Number(survey.total_responses),
					totalResponsesAI: Number(totalResponsesAIAllSurveys),
					surveyMaxResponses: Number(maxResponses),
					surveyMaxChatResponses: Number(maxChatResponses),
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching surveys:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch surveys' },
			{ status: 500 }
		);
	}
}
export async function POST(request: Request) {
	try {
		const { pathname } = new URL(request.url);
		const slug = pathname.split('/').pop();

		// Find the survey by slug to get the ID and limits info
		const survey = await prisma.surveys.findUnique({
			where: { slug },
		});

		if (!survey) {
			return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
		}

		// Get the owner's subscription
		const userSub = await prisma.user_subscriptions.findFirst({
			where: { user_id: survey.user_id },
			select: { plan_id: true },
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
		const planId = userSub?.plan_id || 1;

		// Get the plan features
		const plan = await prisma.subscription_plans.findUnique({
			where: { id: +planId },
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

		// Check limits
		const totalResponses = Number(survey.total_responses);
		const totalResponsesAI = Number(totalResponsesAIAllSurveys);
		if (
			totalResponses >= Number(maxResponses) ||
			totalResponsesAI >= Number(maxChatResponses)
		) {
			return NextResponse.json(
				{
					error:
						'Survey has reached its response limit. New responses are not allowed.',
				},
				{ status: 403 }
			);
		}

		// Parse request body
		const body = await request.json();
		const { answers, email, conversationalAI } = body;

		// Validate that answers is an array
		if (!Array.isArray(answers)) {
			return NextResponse.json(
				{ error: 'Invalid answers format. Expected an array.' },
				{ status: 400 }
			);
		}

		// Create response in database
		const response = await prisma.responses.create({
			data: {
				survey_id: survey.id,
				email: email || null,
				answers: answers,
			},
		});

		if (conversationalAI === true) {
			await prisma.surveys.update({
				where: { id: survey.id },
				data: {
					total_responses: { increment: 1 },
					total_responses_ai: { increment: 1 },
				},
			});
		} else {
			await prisma.surveys.update({
				where: { id: survey.id },
				data: {
					total_responses: { increment: 1 },
				},
			});
		}

		return NextResponse.json(
			{ message: 'Response saved successfully', responseId: response.id },
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error saving survey response:', error);
		return NextResponse.json(
			{ error: 'Failed to save survey response' },
			{ status: 500 }
		);
	}
}
