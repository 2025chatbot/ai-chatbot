// pages/CompanyList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Card, CardContent, Button, Stack, Typography
} from '@mui/material';
import { PageContainer, PageTitle } from '../components/CommonUI';
import styled from 'styled-components';

const CompanyCard = styled(Card)`
    margin-bottom: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 12px;
`;

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/companies')
            .then((res) => res.json())
            .then((data) => setCompanies(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error('병원 목록 불러오기 실패:', err);
                setCompanies([]);
            });
    }, []);

    return (
        <PageContainer>
            <PageTitle>📋 등록된 병원 목록</PageTitle>

            {companies.length === 0 ? (
                <Typography color="text.secondary" textAlign="center">
                    등록된 병원이 없습니다.
                </Typography>
            ) : (
                companies.map((name) => (
                    <CompanyCard key={name}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {name}
                            </Typography>

                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                <Button variant="outlined" component={Link} to={`/company/${name}`}>
                                    병원 페이지 이동
                                </Button>
                                <Button variant="outlined" component={Link} to={`/addqna/${name}`}>
                                    Q&A 업데이트
                                </Button>
                                <Button variant="outlined" component={Link} to={`/noinfo/${name}`}>
                                    답변 대기 목록
                                </Button>
                            </Stack>
                        </CardContent>
                    </CompanyCard>
                ))
            )}
        </PageContainer>
    );
};

export default CompanyList;
