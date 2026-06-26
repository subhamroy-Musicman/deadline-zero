import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

export async function POST(req: NextRequest) {
  let goal = 'Your Goal';
  try {
    const body = await req.json();
    if (body.goal) goal = body.goal;

    if (!goal || goal === 'Your Goal') {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Mock mode if no key provided
      return NextResponse.json(getMockRoadmap(goal));
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Define the schema for structured output
    const roadmapSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        agentLogs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stage: { type: Type.STRING, description: "One of: Observe, Analyze, Plan, Act, Reflect" },
              message: { type: Type.STRING }
            },
            required: ["stage", "message"]
          }
        },
        tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              estimatedMinutes: { type: Type.INTEGER },
              urgencyScore: { type: Type.INTEGER, description: "1-100" },
              confidenceScore: { type: Type.INTEGER, description: "1-100" },
              reasoning: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              subTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING } },
                  required: ["title"]
                }
              }
            },
            required: ["title", "description", "estimatedMinutes", "urgencyScore", "confidenceScore", "reasoning"]
          }
        }
      },
      required: ["agentLogs", "tasks"]
    };

    const prompt = `You are an autonomous productivity agent. The user wants to achieve this goal: "${goal}".
Break this down into a structured, highly actionable roadmap.
Divide the roadmap into clear chronological phases (e.g., "Week 1: Foundations", "Week 2: Core Features").
For EACH task you create, prepend the title with the phase name, like "[Week 1] Set up repository" or "[Phase 1] Initial Research".

For each task, assign an urgency score (0-100), estimated minutes, a realistic deadline (relative to today), and a confidence score explaining why you assigned this priority. Include subtasks.
Also, generate an Agent Pipeline log (Observe, Analyze, Plan, Act, Reflect) explaining your thought process for this roadmap.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: roadmapSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);

    // Map output to our Task interface (adding IDs, deadlines, status)
    const processedTasks = data.tasks.map((t: any, index: number) => ({
      ...t,
      id: `task-roadmap-${Date.now()}-${index}`,
      status: 'pending',
      deadline: new Date(Date.now() + (index + 1) * 86400000 * 2).toISOString(), // Stagger deadlines by 2 days
      subTasks: t.subTasks?.map((st: any, i: number) => ({
        ...st,
        id: `st-${Date.now()}-${i}`,
        completed: false
      })) || []
    }));

    return NextResponse.json({
      tasks: processedTasks,
      agentLogs: data.agentLogs
    });

  } catch (error) {
    console.error('Roadmap Generation Error, falling back to mock:', error);
    return NextResponse.json(getMockRoadmap(goal || 'Your Goal'));
  }
}

// Fallback Mock if no API key is provided
function getMockRoadmap(goal: string) {
  return {
    agentLogs: [
      { stage: 'Observe', message: `Goal complexity for '${goal}' evaluated as HIGH.` },
      { stage: 'Analyze', message: `Historical focus patterns suggest breaking into 3 weekly phases.` },
      { stage: 'Plan', message: `Generated 3 sequential tasks with dependent deadlines.` },
      { stage: 'Act', message: `Tasks populated into dashboard.` },
      { stage: 'Reflect', message: `Workload balanced to avoid burnout. Monitoring progress.` }
    ],
    tasks: [
      {
        id: `task-mock-1`,
        title: `Phase 1: Foundation for ${goal}`,
        description: `Initial setup and core concepts.`,
        deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
        urgencyScore: 95,
        confidenceScore: 92,
        reasoning: ["Foundational prerequisite", "Low initial effort required"],
        status: 'pending',
        estimatedMinutes: 120,
        subTasks: [
          { id: 'st-m-1', title: 'Gather resources', completed: false },
          { id: 'st-m-2', title: 'Setup environment', completed: false }
        ]
      },
      {
        id: `task-mock-2`,
        title: `Phase 2: Execution`,
        description: `Building out the main requirements.`,
        deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
        urgencyScore: 60,
        confidenceScore: 85,
        reasoning: ["Dependent on Phase 1", "Requires deep focus blocks"],
        status: 'pending',
        estimatedMinutes: 300,
        subTasks: [
          { id: 'st-m-3', title: 'Implement logic', completed: false }
        ]
      }
    ]
  };
}
