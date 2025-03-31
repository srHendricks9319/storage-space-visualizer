// src/App.js
import React, { useState } from "react";
import "./App.css";
import Diagram from "./components/Diagram";
import Form from "./components/Form";

const App = () => {
  const [boxSize, setBoxSize] = useState({
    depth: 120,
    width: 120,
    height: 120,
  });
  const [tempBoxSize, setTempBoxSize] = useState({ ...boxSize });
  const [items, setItems] = useState([]);

  const handleAddItem = (item) => {
    setItems([...items, item]);
  };

  const handleDeleteItems = (item) => {
    setItems(items.filter((f) => f.name !== item.name));
  };

  const handleInputChange = (e, dimension) => {
    setTempBoxSize({ ...tempBoxSize, [dimension]: e.target.value });
  };

  const handleInputBlur = (dimension) => {
    setBoxSize({ ...boxSize, [dimension]: parseInt(tempBoxSize[dimension]) });
  };

  return (
    <div className="w-screen h-screen">
      <div className="flex h-full">
        <div id="box-container" className="w-3/4">
          <div className="px-4 pt-2 absolute">
            <h1 className="text-3xl">Storage Visualizer</h1>
            <p className="text-sm pt-2">
              Organize all your storage items within a defined space
            </p>
          </div>

          <Diagram items={items} boxSize={boxSize} />
        </div>
        <div className="w-1/4 flex flex-col gap-10 h-full py-8 mx-4">
          <div id="box" className="flex flex-col gap-2 h-1/5">
            <div className="flex gap items-baseline gap-1">
              <h2 className="text-lg ">Storage Dimensions</h2>
              <p className="text-xs">(inches)</p>
            </div>

            <label>
              Depth:
              <input
                type="number"
                className="ml-2"
                value={tempBoxSize.depth}
                onChange={(e) => handleInputChange(e, "depth")}
                onBlur={() => handleInputBlur("depth")}
              />
            </label>
            <label>
              Width:
              <input
                type="number"
                className="ml-2"
                value={tempBoxSize.width}
                onChange={(e) => handleInputChange(e, "width")}
                onBlur={() => handleInputBlur("width")}
              />
            </label>
            <label>
              Height:
              <input
                type="number"
                className="ml-2"
                value={tempBoxSize.height}
                onChange={(e) => handleInputChange(e, "height")}
                onBlur={() => handleInputBlur("height")}
              />
            </label>
          </div>
          <div id="item_form" className="flex flex-col gap-2 h-1/5">
            <h2 className="text-lg">Items</h2>
            <Form onAdd={handleAddItem} />
          </div>
          <div id="itemList" className="h-3/5 overflow-y-auto">
            <div className="flex flex-col gap-4 h-fit">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between border p-2 rounded"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <h3>{item.name}</h3>
                      <svg width="10" height="10">
                        <circle cx="5" cy="5" r="5" fill={`${item.color}`} />
                      </svg>
                    </div>

                    <div className="flex gap-2">
                      <p>W: {item.width}</p>
                      <p>H: {item.height}</p>
                      <p>D: {item.depth}</p>
                    </div>
                  </div>
                  <button
                    className="text-red-500"
                    onClick={() => handleDeleteItems(item)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
