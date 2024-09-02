import React, { useState, FormEvent } from "react";

const AdvancedSearch = ({ onSubmit }: any) => {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [rating, setRating] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags] = useState("");
  const [availability, setAvailability] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Format the query
    let query = "Find professors";
    if (department) query += ` in the ${department} department`;
    if (rating) query += ` with a minimum rating of ${rating}`;
    if (course) query += `, who teach ${course}`;
    if (availability) query += `, and are available in ${availability}.`;

    if (query === "Find professors") {
      query = "Find professors matching your criteria.";
    }

    // Reset fields
    setName("");
    setDepartment("");
    setCourse("");
    setRating("");
    setDifficulty("");
    setTags("");
    setAvailability("");
    // Pass the query back to the parent component (Chatbox)
    onSubmit(query);
  };

  return (
    <div className="flex flex-col gap-10 max-w-2xl mx-auto">
      {/* Title */}
      <div className="text-3xl font-bold text-center text-[#F5851E]">
        Advanced Professor Search
      </div>
      {/* Instructions */}
      <div className="text-gray-700 text-center">
        Use the form below to search for professors based on specific criteria. 
        You can filter by professor name, department, course, ratings, and more. 
        This tool helps you find the best match for your academic needs by analyzing 
        and indexing relevant data from Rate My Professor links.
      </div>
      {/* Submission */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          {/* Prof Name */}
          <div>
            <label className="text-lg text-gray-600">Professor Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5851E] text-black"
            />
          </div>
          {/* Department */}
          <div>
            <label className="text-lg text-gray-600">Department:</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Computer Science"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5851E] text-black"
            />
          </div>
          {/* Course Name/code */}
          <div>
            <label className="text-lg text-gray-600">Course Name/Code:</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g., CS101"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5851E] text-black"
            />
          </div>
          {/* Min Rating */}
          <div>
            <label className="text-lg text-gray-600">Minimum Rating:</label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="e.g., 4.0"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5851E] text-black"
              min="1"
              max="5"
              step="0.1"
            />
          </div>
          {/* Max diff */}
          <div>
            <label className="text-lg text-gray-600">Maximum Difficulty:</label>
            <input
              type="number"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              placeholder="e.g., 3.5"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5851E] text-black"
              min="1"
              max="5"
              step="0.1"
            />
          </div>
          {/* Tags */}
          <div>
            <label className="text-lg text-gray-600">
              Tags (comma separated):
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., engaging, tough grader"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5851E] text-black"
            />
          </div>
          {/* Availability */}
          <div className="col-span-2">
            <label className="text-lg text-gray-600">Availability:</label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g., Fall 2024"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5851E] text-black"
            />
          </div>
        </div>
        <button
          type="submit"
          className={`mt-4 px-4 py-3 w-full bg-[#F5851E] text-white font-semibold rounded-lg shadow-md transition duration-200 hover:bg-[#F5851E]/80`}
        >
          Submit Search
        </button>
      </form>
    </div>
  );
};

export default AdvancedSearch;
