
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import TeacherMainBoard from '../TeacherMainBoard';
import StudentBoardsGrid from '../StudentBoardsGrid';
import { GridOrientation } from '../TeacherView';
import { StudentBoardInfo } from '@/utils/studentBoardGenerator';
import { SyncDirection } from '@/types/student';

interface TeacherSessionResizablePanelsProps {
  activeSession: {
    id: string;
    title: string;
    unique_url_slug: string;
    status: string;
    created_at: string;
    teacher_id: string;
  };
  studentCount: number;
  activeStudentCount?: number;
  currentLayout: any;
  currentStudentBoards: any[];
  currentStudentBoardsInfo: (StudentBoardInfo | null)[];
  currentPage: number;
  totalPages: number;
  gridOrientation: GridOrientation;
  maximizedBoard: string | null;
  isControlsCollapsed: boolean;
  isSplitView2Active?: boolean;
  teacherSenderId?: string;
  onMaximize: (boardId: string) => void;
  onMinimize: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  // Add sync direction props
  onToggleSyncDirection?: (participantId: number) => Promise<boolean>;
  getSyncDirection?: (participantId: number) => SyncDirection;
  isParticipantUpdating?: (participantId: number) => boolean;
}

const TeacherSessionResizablePanels: React.FC<TeacherSessionResizablePanelsProps> = ({
  activeSession,
  studentCount,
  activeStudentCount,
  currentLayout,
  currentStudentBoards,
  currentStudentBoardsInfo,
  currentPage,
  totalPages,
  gridOrientation,
  maximizedBoard,
  isControlsCollapsed,
  isSplitView2Active = false,
  teacherSenderId,
  onMaximize,
  onMinimize,
  onPreviousPage,
  onNextPage,
  onToggleSyncDirection,
  getSyncDirection,
  isParticipantUpdating,
}) => {
  // If Split View 2 is active, only show teacher board
  if (isSplitView2Active) {
    return (
      <div className="h-full relative">
        <TeacherMainBoard 
          onMaximize={onMaximize}
          onMinimize={onMinimize}
          maximizedBoard={maximizedBoard}
          isHeaderCollapsed={isControlsCollapsed}
          sessionId={activeSession.id}
          senderId={teacherSenderId || activeSession.teacher_id}
        />
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="rounded-lg overflow-hidden">
      {/* Left Pane - Teacher's Main Board */}
      <ResizablePanel defaultSize={60} minSize={40}>
        <div className="h-full relative">
          <TeacherMainBoard 
            onMaximize={onMaximize}
            onMinimize={onMinimize}
            maximizedBoard={maximizedBoard}
            isHeaderCollapsed={isControlsCollapsed}
            sessionId={activeSession.id}
            senderId={teacherSenderId || activeSession.teacher_id}
          />
        </div>
      </ResizablePanel>

      <ResizableHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors duration-150" />

      {/* Right Pane - Student Boards Grid */}
      <ResizablePanel defaultSize={40} minSize={30}>
        <div className="h-full relative">
          <StudentBoardsGrid
            studentCount={studentCount}
            activeStudentCount={activeStudentCount || 0}
            currentLayout={currentLayout}
            currentStudentBoardsInfo={currentStudentBoardsInfo}
            currentPage={currentPage}
            totalPages={totalPages}
            gridOrientation={gridOrientation}
            maximizedBoard={maximizedBoard}
            onMaximize={onMaximize}
            onMinimize={onMinimize}
            onPreviousPage={onPreviousPage}
            onNextPage={onNextPage}
            isHeaderCollapsed={isControlsCollapsed}
            sessionId={activeSession.id}
            senderId={teacherSenderId || activeSession.teacher_id}
            onToggleSyncDirection={onToggleSyncDirection}
            getSyncDirection={getSyncDirection}
            isParticipantUpdating={isParticipantUpdating}
            isTeacher={true}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default TeacherSessionResizablePanels;
