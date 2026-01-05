import { Student, LayoutConfig } from "../types";

export const generateEmptyGrid = (size: number): (Student | null)[] => {
  return Array(size).fill(null);
};

export const resizeGrid = (
  currentGrid: (Student | null)[], 
  newSize: number
): (Student | null)[] => {
  if (currentGrid.length === newSize) return currentGrid;
  
  const newGrid = Array(newSize).fill(null);
  currentGrid.forEach((student, i) => {
    if (i < newSize) {
      newGrid[i] = student;
    }
  });
  return newGrid;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Demo data for Girls (First half)
export const DEMO_GIRLS = `1. 陳大文 Peter
2. 李小龍 Bruce
3. 張學友 Jacky
4. 劉德華 Andy
5. 黎明 Leon
6. 郭富城 Aaron
7. 梁朝偉 Tony
8. 周星馳 Stephen
9. 成龍 Jackie
10. 甄子丹 Donnie`;

// Demo data for Boys (Second half)
export const DEMO_BOYS = `11. 古天樂 Louis
12. 吳彥祖 Daniel
13. 謝霆鋒 Nicholas
14. 陳奕迅 Eason
15. 鄧紫棋 GEM
16. 王菲 Faye
17. 鄭秀文 Sammi
18. 楊千嬅 Miriam
19. 容祖兒 Joey
20. 陳慧琳 Kelly`;