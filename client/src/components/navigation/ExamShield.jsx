import React from 'react';

export default function ExamShield({ children }) {
    // ExamShield passes through all children components cleanly.
    // Exam Mode features are accessed explicitly at /exams without hijacking standard routes.
    return <>{children}</>;
}
