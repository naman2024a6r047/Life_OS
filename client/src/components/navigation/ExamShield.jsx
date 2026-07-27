import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function ExamShield({ children }) {
    const { isExamMode } = useContext(AuthContext);
    const location = useLocation();

    if (isExamMode) {
        // Allowed routes during Exam Mode
        const isExamRoute = location.pathname.startsWith('/exams');
        const isFriendsRoute = location.pathname.startsWith('/friends');
        
        if (!isExamRoute && !isFriendsRoute) {
            return <Navigate to="/exams" replace />;
        }
    }

    return <>{children}</>;
}
