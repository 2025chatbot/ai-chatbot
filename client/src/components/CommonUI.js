import styled from "styled-components";
import { Box, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import React from "react";

export const PageContainer = styled(Box)`
  max-width: 800px;
  margin: 5rem auto;
  padding: 2rem;
  background-color: #fdfdfd;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
`;

export const PageTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem auto;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  display: block;

  &:focus {
    border-color: #007aff;
  }
`;

const LinkBehavior = React.forwardRef((props, ref) => (
  <RouterLink ref={ref} {...props} />
));

export const LinkButton = ({ to, children }) => (
  <Button
    type="button"
    variant="outlined"
    component={LinkBehavior}
    to={to}
    sx={{
      width: "100%",
      justifyContent: "flex-start",
      textTransform: "none",
      fontWeight: "500",
      fontSize: "1.1rem",
      color: "black",
      borderColor: "#ddd",
      padding: "1rem 1.5rem",
      borderRadius: "8px",
      marginBottom: "0.75rem",
    }}
  >
    {children}
  </Button>
);

export const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const QnaBox = styled.div`
  width: 100%;
  margin: 1rem auto;
  border: 1px solid #eee;
  padding: 0.3rem 1rem;
  border-radius: 12px;
  background-color: #fafafa;
  position: relative;
  transition:
    transform 0.3s ease-out,
    opacity 0.3s ease-out;
  box-sizing: border-box;

  &.removing {
    transform: translateX(100%);
    opacity: 0;
  }
`;

export const RemoveBtn = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background-color: #bdbdbd;
  color: black;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    background-color: #c0392b;
  }
`;

export const PrimaryButton = styled.button`
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  background-color: #007aff;
  color: white;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }
`;

export const SecondaryButton = styled.button`
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  background-color: #eee;
  color: #333;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }

  & + & {
    margin-left: 0.8rem;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
`;
