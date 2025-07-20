import React from "react";
import {
  LinkButton,
  LinkList,
  PageContainer,
  PageTitle,
} from "../components/CommonUI";

const Home = () => {
  return (
    <PageContainer>
      <PageTitle>⚙️ 병원 관리</PageTitle>
      <LinkList>
        <LinkButton to="/admin/companies">📋 병원 목록</LinkButton>
        <LinkButton to="/admin/create">➕ 새 병원 생성</LinkButton>
      </LinkList>
    </PageContainer>
  );
};

export default Home;
