export interface LayoutOption {
  id: string;
  name: string;
  description: string;
  gridClass: string;
  studentsPerPage: number;
  totalPages: number;
  icon: string; // lucide-react icon name
}

import { GridOrientation } from '@/components/TeacherView';

export const calculateLayoutOptions = (studentCount: number): LayoutOption[] => {
  const options: LayoutOption[] = [];

  if (studentCount === 1) {
    options.push({
      id: '1x1',
      name: '1×1',
      description: 'Single board',
      gridClass: 'grid-cols-1',
      studentsPerPage: 1,
      totalPages: 1,
      icon: 'square'
    });
  } else if (studentCount === 2) {
    options.push({
      id: '1x2',
      name: '1×2',
      description: 'Vertical stack',
      gridClass: 'grid-cols-1',
      studentsPerPage: 2,
      totalPages: 1,
      icon: 'rectangle-vertical'
    });
  } else if (studentCount >= 3) {
    // Always offer 1x2 for 3+ students
    const pages1x2 = Math.ceil(studentCount / 2);
    options.push({
      id: '1x2',
      name: '1×2',
      description: `${pages1x2} page${pages1x2 > 1 ? 's' : ''} of 2 boards`,
      gridClass: 'grid-cols-1',
      studentsPerPage: 2,
      totalPages: pages1x2,
      icon: 'rectangle-vertical'
    });

    // 2x2 for 3-4 students (single page) or 5-8 students (multiple pages)
    if (studentCount <= 4) {
      options.push({
        id: '2x2',
        name: '2×2',
        description: 'Grid layout',
        gridClass: 'grid-cols-2',
        studentsPerPage: 4,
        totalPages: 1,
        icon: 'grid-2x2'
      });
    } else if (studentCount <= 8) {
      const pages2x2 = Math.ceil(studentCount / 4);
      options.push({
        id: '2x2',
        name: '2×2',
        description: `${pages2x2} page${pages2x2 > 1 ? 's' : ''} of 4 boards`,
        gridClass: 'grid-cols-2',
        studentsPerPage: 4,
        totalPages: pages2x2,
        icon: 'grid-2x2'
      });
    }

    // 2x3 for 5-8 students
    if (studentCount >= 5) {
      const pages2x3 = Math.ceil(studentCount / 6);
      options.push({
        id: '2x3',
        name: '2×3',
        description: `${pages2x3} page${pages2x3 > 1 ? 's' : ''} of 6 boards`,
        gridClass: 'grid-cols-2',
        studentsPerPage: 6,
        totalPages: pages2x3,
        icon: 'grid-3x3'
      });
    }
  }

  return options;
};

export const getOrientationAwareGridClasses = (
  layout: LayoutOption,
  orientation: GridOrientation
): string => {
  const baseClasses = 'place-items-stretch';
  
  // Determine rows and columns based on layout
  let rows: number;
  let cols: number;
  
  switch (layout.id) {
    case '1x1':
      return `grid-cols-1 grid-rows-1 ${baseClasses}`;
    case '1x2':
      if (orientation === 'columns-first') {
        return `grid-cols-1 grid-rows-2 ${baseClasses}`;
      } else {
        return `grid-cols-2 grid-rows-1 ${baseClasses}`;
      }
    case '2x2':
      return `grid-cols-2 grid-rows-2 ${baseClasses}`;
    case '2x3':
      if (orientation === 'columns-first') {
        return `grid-cols-2 grid-rows-3 ${baseClasses}`;
      } else {
        return `grid-cols-3 grid-rows-2 ${baseClasses}`;
      }
    default:
      return `${layout.gridClass} ${baseClasses}`;
  }
};

export const generateStudentBoards = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => 
    `student-${String.fromCharCode(97 + i)}`
  );
};

export const getStudentBoardsForPage = (
  studentBoards: string[], 
  page: number, 
  studentsPerPage: number
): string[] => {
  const startIndex = page * studentsPerPage;
  const endIndex = Math.min(startIndex + studentsPerPage, studentBoards.length);
  return studentBoards.slice(startIndex, endIndex);
};

export const generateGridSlots = (
  studentBoards: string[],
  page: number,
  studentsPerPage: number
): (string | null)[] => {
  const currentPageBoards = getStudentBoardsForPage(studentBoards, page, studentsPerPage);
  const slots: (string | null)[] = [...currentPageBoards];
  
  // Fill remaining slots with null for empty placeholders
  while (slots.length < studentsPerPage) {
    slots.push(null);
  }
  
  return slots;
};
