import React, { useState } from "react";

const Form = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [height, setHeight] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !depth || !width || !height) return;
    onAdd({
      id: crypto.randomUUID(),
      name,
      depth: parseInt(depth),
      width: parseInt(width),
      height: parseInt(height),
      color:
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"),
    });
    setName("");
    setDepth("");
    setWidth("");
    setHeight("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div id="dimensions" className="flex gap-2">
        <input
          type="number"
          className="w-1/3"
          placeholder="Depth"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        />
        <input
          type="number"
          className="w-1/3"
          placeholder="Width"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        />
        <input
          type="number"
          className="w-1/3"
          placeholder="Height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-700 my-2"
      >
        Add Item
      </button>
    </form>
  );
};

export default Form;
