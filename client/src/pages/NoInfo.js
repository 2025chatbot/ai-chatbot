import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, TextField, Button,
    Paper, Stack, IconButton, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const NoInfo = () => {
    const { company } = useParams();
    const [qnaList, setQnaList] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/noinfo/${company}`)
            .then(res => res.json())
            .then(data => {
                setQnaList(data.map(q => ({
                    original: q.question,
                    question: q.question,
                    answer: '',
                    count: q.count
                })));
            });
    }, [company]);

    const updateQna = (index, field, value) => {
        const updated = [...qnaList];
        updated[index][field] = value;
        setQnaList(updated);
    };

    const removeQna = async (index) => {
        const target = qnaList[index];
        if (!window.confirm(`"${target.question}" 질문을 삭제할까요?`)) return;

        const res = await fetch(`http://localhost:3000/noinfo/${company}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: target.original })
        });

        if (res.ok) {
            const updated = [...qnaList];
            updated.splice(index, 1);
            setQnaList(updated);
        } else {
            alert('서버 삭제 실패');
        }
    };

    const handleSubmit = async () => {
        const valid = qnaList.filter(q => q.question && q.answer);
        if (valid.length === 0) return alert('답변이 입력된 질문이 없습니다.');

        const res = await fetch(`http://localhost:3000/noinfo/${company}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(valid)
        });

        if (res.ok) {
            alert('학습 반영 완료!');
            const remaining = qnaList.filter(q => !valid.find(v => v.original === q.original));
            setQnaList(remaining);
        } else {
            alert('저장 실패');
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, py: 6 }}>
            <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
                답변 대기 질문 목록
            </Typography>

            {qnaList.length === 0 ? (
                <Typography textAlign="center" color="text.secondary">새로운 질문이 없습니다.</Typography>
            ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <Stack spacing={3}>
                        {qnaList.map((qna, index) =>
                        {
                            console.log(`[${index}] value:`, qna.question);
                            return (
                            <Paper
                                key={index}
                                elevation={3}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    position: 'relative',
                                    backgroundColor: '#fafafa'
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Chip
                                        label={`문의 횟수: ${qna.count || 1}`}
                                        color="primary"
                                        size="small"
                                    />
                                    <IconButton size="small" onClick={() => removeQna(index)}>
                                        <DeleteIcon fontSize="small" color="error" />
                                    </IconButton>
                                </Box>

                                <TextField
                                    label="질문"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    value={qna.question}
                                    onChange={(e) => updateQna(index, 'question', e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    label="답변"
                                    placeholder="여기에 답변을 작성하세요"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    value={qna.answer}
                                    onChange={(e) => updateQna(index, 'answer', e.target.value)}
                                />
                            </Paper>);}
                        )}

                        <Box textAlign="center" mt={4}>
                            <Button type="submit" variant="contained" size="large">
                                답변 등록
                            </Button>
                        </Box>
                    </Stack>
                </form>
            )}
        </Box>
    );
};

export default NoInfo;
