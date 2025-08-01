
import React from 'react';
import TeacherMainBoard from '../TeacherMainBoard';
import StudentBoardsWindow from '../StudentBoardsWindow';
import { GridOrientation } from '../TeacherView';
import { StudentBoardInfo } from '@/utils/studentBoardGenerator';
import { SyncDirection } from '@/types/student';

interface TeacherSessionSplitViewProps {
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
  availableLayouts: any[];
  selectedLayoutId: string;
  currentStudentBoards: any[];
  currentStudentBoardsInfo: (StudentBoardInfo | null)[];
  currentPage: number;
  totalPages: number;
  gridOrientation: GridOrientation;
  maximizedBoard: string | null;
  isControlsCollapsed: boolean;
  teacherSenderId?: string;
  onMaximize: (boardId: string) => void;
  onMinimize: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLayoutChange: (layoutId: string) => void;
  onOrientationChange: (orientation: GridOrientation) => void;
  onCloseSplitView: () => void;
  // Add sync direction props
  onToggleSyncDirection?: (participantId: number) => Promise<boolean>;
  getSyncDirection?: (participantId: number) => SyncDirection;
  isParticipantUpdating?: (participantId: number) => boolean;
}

const TeacherSessionSplitView: React.FC<TeacherSessionSplitViewProps> = ({
  activeSession,
  studentCount,
  activeStudentCount,
  currentLayout,
  availableLayouts,
  selectedLayoutId,
  currentStudentBoards,
  currentStudentBoardsInfo,
  currentPage,
  totalPages,
  gridOrientation,
  maximizedBoard,
  isControlsCollapsed,
  teacherSenderId,
  onMaximize,
  onMinimize,
  onPreviousPage,
  onNextPage,
  onLayoutChange,
  onOrientationChange,
  onCloseSplitView,
  onToggleSyncDirection,
  getSyncDirection,
  isParticipantUpdating,
}) => {
  return (
    <>
      {/* Split View Window */}
      <StudentBoardsWindow
        studentCount={studentCount}
        currentLayout={currentLayout}
        availableLayouts={availableLayouts}
        selectedLayoutId={selectedLayoutId}
        currentStudentBoardsInfo={currentStudentBoardsInfo}
        currentPage={currentPage}
        totalPages={totalPages}
        gridOrientation={gridOrientation}
        onMaximize={onMaximize}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onLayoutChange={onLayoutChange}
        onOrientationChange={onOrientationChange}
        onClose={onCloseSplitView}
        sessionId={activeSession.id}
        senderId={teacherSenderId || activeSession.teacher_id}
        onToggleSyncDirection={onToggleSyncDirection}
        getSyncDirection={getSyncDirection}
        isParticipantUpdating={isParticipantUpdating}
      />

      {/* Single panel view - only teacher's board when split view is active */}
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
    </>
  );
};

export default TeacherSessionSplitView;
