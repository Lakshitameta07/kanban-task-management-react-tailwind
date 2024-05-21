import React, { useState,useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./components/Header";
import Home from "./components/Home";
import EmptyBoard from './components/EmptyBoard';
import { setBoardActive,fetchBoards } from "./redux/BackendActions";

function App() {
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const dispatch = useDispatch();
  const boards = useSelector((state) => state.boards.boards);
  useEffect(() => {
      dispatch(fetchBoards());
    }, [dispatch]);
  
    useEffect(() => {
      const activeBoard = boards.find((board) => board.isActive);
      if (!activeBoard && boards.length > 0) {
        dispatch(setBoardActive({ index: 0 }));
      }
    }, [dispatch, boards]);
  return (
    <div className="overflow-hidden  overflow-x-scroll">
      <>
        {boards.length > 0 ?
        <>
        <Header
          setIsBoardModalOpen={setIsBoardModalOpen}
          isBoardModalOpen={isBoardModalOpen}
        />
        <Home
          setIsBoardModalOpen={setIsBoardModalOpen}
          isBoardModalOpen={isBoardModalOpen}
        />
        </>
        :
        <>
          <EmptyBoard type='add'/>
        </>
      }
        
      </>
    </div>
  );
}

export default App;
