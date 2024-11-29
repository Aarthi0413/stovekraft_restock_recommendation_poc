import React, { useEffect } from 'react'
import TableList from './TableList'
import domo from "ryuu.js";

const Table = () => {

  const [branch, setBranch] = React.useState([]);
  const [data, setData] = React.useState([]);

  useEffect(() => {
    domo
      .get("/data/v1/stock_data")
      .then((data) => {

        const branchFilter = Array.from(
          new Set(data.map((val) => val['Outlet Name']))
        ).map((product) => {
          return { value: product, label: product };
        });
        setBranch(branchFilter);
        setData(data);

      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="">
      <TableList data={data} branch={branch} />
    </div>
  )
}

export default Table;