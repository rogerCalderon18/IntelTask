import React from "react";
import { FiPlay, FiTrash2, FiEdit } from "react-icons/fi";

const SubTareaItem = ({ titulo }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center">
      <FiPlay className="text-gray-600 mr-2" />
      <span className="text-sm text-gray-700 hover:underline cursor-pointer">{titulo}</span>
    </div>
    <div className="flex items-center gap-2">
      <FiTrash2 className="text-gray-500 hover:text-red-500 cursor-pointer" />
      <FiEdit className="text-gray-500 hover:text-blue-500 cursor-pointer" />
    </div>
  </div>
);

export default SubTareaItem;