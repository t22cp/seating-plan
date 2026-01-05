import { GoogleGenAI, Type } from "@google/genai";
import { Student, Constraint, LayoutConfig } from "../types";

// Helper to validate key
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY environment variable is missing.");
  return new GoogleGenAI({ apiKey });
};

// Now returns basic objects without IDs or Gender (assigned by caller)
export const parseStudentList = async (rawText: string): Promise<Omit<Student, 'id' | 'gender'>[]> => {
  if (!rawText.trim()) return [];

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Parse the following raw text into a structured JSON list of students. 
      The text contains student information, typically including a Class Number, Chinese Name, and English Name.
      
      Extract fields:
      - classNo (number or string, remove parentheses if present)
      - nameChi (Chinese characters)
      - nameEng (English name)
      
      Raw Text:
      ${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              classNo: { type: Type.STRING },
              nameChi: { type: Type.STRING },
              nameEng: { type: Type.STRING },
            },
            required: ["classNo", "nameChi", "nameEng"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
};

export const optimizeSeatingLayout = async (
  currentGrid: (Student | null)[],
  constraints: Constraint[],
  config: LayoutConfig
): Promise<(Student | null)[]> => {
  // Extract only active students
  const activeStudents = currentGrid.filter(s => s !== null) as Student[];

  if (activeStudents.length === 0) return currentGrid;

  try {
    const ai = getClient();
    const studentsJson = JSON.stringify(activeStudents.map(s => ({ 
      id: s.id, 
      name: `${s.nameChi} ${s.nameEng}`,
      gender: s.gender 
    })));
    const constraintsJson = JSON.stringify(constraints);

    const prompt = `
      I need to organize a classroom seating plan.
      
      Grid Dimensions: ${config.rows} Rows x ${config.columns} Columns.
      Total Seats: ${config.rows * config.columns}.
      
      Students: ${studentsJson}
      
      Constraints:
      ${constraintsJson}
      
      Rules:
      1. The layout fills from Top-Left (Index 0) to Bottom-Right.
      2. The Blackboard is at the BOTTOM.
      3. "SEPARATE" constraint: Each constraint contains a list of student IDs. NO two students within the SAME constraint list can be adjacent to each other (horizontally, vertically, or diagonally). If a constraint has 3 students [A, B, C], then A!=B, B!=C, A!=C in adjacency.
      
      Task:
      Return a reordered list of Student IDs. 
      You MUST return exactly ${activeStudents.length} IDs.
      The order represents the filling order of the grid (0, 1, 2...).
      Try to satisfy all constraints.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from optimization");
    
    const reorderedIds: string[] = JSON.parse(text);
    
    // Reconstruct grid
    const newGrid: (Student | null)[] = Array(config.rows * config.columns).fill(null);
    const studentMap = new Map(activeStudents.map(s => [s.id, s]));
    
    reorderedIds.forEach((id, index) => {
      if (index < newGrid.length && studentMap.has(id)) {
        newGrid[index] = studentMap.get(id) || null;
      }
    });

    // Handle missing students
    const placedIds = new Set(reorderedIds);
    let nextFreeSlot = 0;
    activeStudents.forEach(s => {
      if (!placedIds.has(s.id)) {
        while (nextFreeSlot < newGrid.length && newGrid[nextFreeSlot] !== null) {
          nextFreeSlot++;
        }
        if (nextFreeSlot < newGrid.length) {
          newGrid[nextFreeSlot] = s;
        }
      }
    });

    return newGrid;

  } catch (error) {
    console.error("Optimization error", error);
    throw error;
  }
};