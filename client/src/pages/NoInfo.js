import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Stack, Tab, Tabs, Typography } from "@mui/material";
import {
  PageContainer,
  PrimaryButton,
  QnaBox,
  RemoveBtn,
  StyledInput,
} from "../components/CommonUI";

const NoInfo = () => {
  const { company } = useParams();
  const [newQnaList, setNewQnaList] = useState([]);
  const [oldQnaList, setOldQnaList] = useState([]);
  const [tab, setTab] = useState(0); // 0: 신규 질문, 1: 기존 질문

  useEffect(() => {
    // 신규 질문 목록 불러오기
    fetch(`http://localhost:3000/noinfo/${company}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNewQnaList(
            data.map((q) => ({
              original: q.question,
              question: q.question,
              answer: "",
              count: q.count,
            })),
          );
        }
      })
      .catch((err) => {
        console.error("신규 질문 fetch 실패:", err);
      });

    // 기존 질문답변 목록 (API 연동)
    fetch(`http://localhost:3000/questions/${company}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOldQnaList(
            data.map((q) => ({
              original: q.question,
              question: q.question,
              answer: q.answer,
              count: 1,
            })),
          );
        }
      })
      .catch((err) => {
        console.error("기존 질문 fetch 실패:", err);
      });
  }, [company]);

  const updateQna = (index, field, value, type) => {
    const list = type === "new" ? [...newQnaList] : [...oldQnaList];
    list[index][field] = value;
    type === "new" ? setNewQnaList(list) : setOldQnaList(list);
  };

  const removeQna = async (index, type) => {
    const list = type === "new" ? [...newQnaList] : [...oldQnaList];
    const target = list[index];
    if (!window.confirm(`"${target.question}" 질문을 삭제할까요?`)) return;

    const url =
      type === "new"
        ? `http://localhost:3000/noinfo/${company}`
        : `http://localhost:3000/questions/${company}`;

    try {
      if (type === "new") {
        const res = await fetch(url, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: target.original }),
        });
        if (!res.ok) throw new Error("삭제 실패");
      } else {
        const res = await fetch(url, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: target.original }),
        });
        if (!res.ok) throw new Error("삭제 실패");
      }
      list.splice(index, 1);
      type === "new" ? setNewQnaList(list) : setOldQnaList(list);
    } catch (err) {
      alert("서버 삭제 실패");
    }
  };

  const handleSaveNew = async () => {
    const unanswered = newQnaList.filter((q) => q.question && !q.answer);
    const valid = newQnaList.filter((q) => q.question && q.answer);

    if (newQnaList.length === 0) return alert("질문이 없습니다.");
    if (valid.length === 0 && unanswered.length > 0)
      return alert("답변이 입력된 질문이 없습니다.");

    const res = await fetch(`http://localhost:3000/noinfo/${company}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valid),
    });

    if (res.ok) {
      alert("신규 질문 저장 완료!");
      const remaining = newQnaList.filter(
        (q) => !valid.find((v) => v.original === q.original),
      );
      setNewQnaList(remaining);
    } else {
      alert("저장 실패");
    }
  };

  const handleSaveOld = async () => {
    // 변경된 QnA만 추려서 PATCH 요청
    const changed = oldQnaList.filter(q => q.question && q.answer);
    if (changed.length === 0) return alert("수정된 QnA가 없습니다.");
    try {
      const res = await fetch(`http://localhost:3000/questions/${company}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changed),
      });
      if (res.ok) {
        alert("기존 QnA 저장(수정) 완료!");
      } else {
        alert("저장(수정) 실패");
      }
    } catch (err) {
      alert("서버 저장(수정) 실패");
    }
  };

  return (
    <PageContainer>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="❓ 신규 QnA" />
        <Tab label="✅ 기존 QnA" />
      </Tabs>

      {tab === 0 && (
        <>
          {newQnaList.length === 0 ? (
            <Typography textAlign="center" color="text.secondary">
              새로운 질문이 없습니다.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {newQnaList.map((qna, index) => (
                <QnaBox key={`new-${index}`}>
                  <RemoveBtn onClick={() => removeQna(index, "new")}>
                    ×
                  </RemoveBtn>
                  <div style={{ marginTop: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        backgroundColor: "#e3f2fd",
                        color: "#1565c0",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "6px",
                        fontWeight: 500,
                        display: "inline-block",
                      }}
                    >
                      문의 횟수: {qna.count || 1}
                    </span>
                  </div>
                  <StyledInput
                    type="text"
                    placeholder="질문"
                    value={qna.question}
                    onChange={(e) =>
                      updateQna(index, "question", e.target.value, "new")
                    }
                    style={{ marginBottom: "1rem" }}
                  />
                  <StyledInput
                    type="text"
                    placeholder="답변"
                    value={qna.answer}
                    onChange={(e) =>
                      updateQna(index, "answer", e.target.value, "new")
                    }
                  />
                </QnaBox>
              ))}
              <div style={{ textAlign: "end", marginTop: "2rem" }}>
                <PrimaryButton onClick={handleSaveNew}>
                  신규 질문 저장
                </PrimaryButton>
              </div>
            </Stack>
          )}
        </>
      )}

      {tab === 1 && (
        <>
          {oldQnaList.length === 0 ? (
            <Typography textAlign="center" color="text.secondary">
              기존 질문이 없습니다.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {oldQnaList.map((qna, index) => (
                <QnaBox key={`old-${index}`}>
                  <RemoveBtn onClick={() => removeQna(index, "old")}>
                    ×
                  </RemoveBtn>
                  <StyledInput
                    type="text"
                    placeholder="질문"
                    value={qna.question}
                    onChange={(e) =>
                      updateQna(index, "question", e.target.value, "old")
                    }
                    style={{ marginBottom: "1rem" }}
                  />
                  <StyledInput
                    type="text"
                    placeholder="답변"
                    value={qna.answer}
                    onChange={(e) =>
                      updateQna(index, "answer", e.target.value, "old")
                    }
                  />
                </QnaBox>
              ))}
              <div style={{ textAlign: "end", marginTop: "2rem" }}>
                <PrimaryButton onClick={handleSaveOld}>
                  기존 질문 저장
                </PrimaryButton>
              </div>
            </Stack>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default NoInfo;
