import React from 'react';
import { HiMiniArrowDownOnSquareStack } from "react-icons/hi2";
import Table from 'DataTable';
import "./app.css";

function App() {
  return (
    <div className='container mx-auto p-3'>
      <div className='flex items-center mb-3'>
        <div className='w-16 h-16 rounded-full bg-[#34a0a4] flex items-center justify-center mr-3'>
          <HiMiniArrowDownOnSquareStack className='text-2xl text-[#ffffff]' />
        </div>
        <h2 className='text-2xl w-fit mt-5 mb-5 font-bold text-[#34a0a4]'>Restock Recommendation</h2>
      </div>
      <Table />
    </div>
  );
}

export default App;

