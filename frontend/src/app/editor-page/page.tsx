"use client";

import React, { useState, useCallback } from "react";
import { Play, Download, Settings, Maximize2, FileText } from "lucide-react";
import Editor from "@monaco-editor/react";
import PanelContainer from "./PanelContainer";
import PanelHeader from "./PanelHeader";
import ResizeHandle from "./ResizeHandle";

// --- Constants & Configuration ---

type LanguageKey = "cpp" | "c" | "java" | "python";

const LANGUAGE_TEMPLATES: Record<LanguageKey, string> = {
  cpp: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        // Write your code here
        return 0;
    }
};

int main() {
    Solution sol;
    vector<int> height = {1,8,6,2,5,4,8,3,7};
    cout << sol.maxArea(height) << endl;
    return 0;
}`,
  c: `#include <stdio.h>
#include <stdlib.h>

int maxArea(int* height, int heightSize) {
    // Write your code here
    return 0;
}

int main() {
    int height[] = {1,8,6,2,5,4,8,3,7};
    int size = sizeof(height) / sizeof(height[0]);
    printf("%d\\n", maxArea(height, size));
    return 0;
}`,
  java: `class Solution {
    public int maxArea(int[] height) {
        // Write your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] height = {1,8,6,2,5,4,8,3,7};
        System.out.println(sol.maxArea(height));
    }
}`,
  python: `class Solution:
    def maxArea(self, height):
        # Write your code here
        return 0

if __name__ == "__main__":
    sol = Solution()
    height = [1,8,6,2,5,4,8,3,7]
    print(sol.maxArea(height))`
};


const CodeEditorPage = () => {
  // Logic State
  const [language, setLanguage] = useState<LanguageKey>("cpp");
  const [code, setCode] = useState(LANGUAGE_TEMPLATES["cpp"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [pdfUrl] = useState(""); 
  
  // UI State
  const [isDragging, setIsDragging] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number | undefined>(undefined);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(256);
  const [inputWidth, setInputWidth] = useState(50);

  const handleLanguageChange = (lang: string) => {
    const validLang = lang as LanguageKey;
    setLanguage(validLang);
    setCode(LANGUAGE_TEMPLATES[validLang]);
  };

  const handleRun = () => {
    setOutput("Code execution is not implemented in this demo.");
  };

  // Centralized Resizing Logic
  const startResizing = useCallback(
    (type: "vertical" | "horizontal" | "input", startEvent: React.MouseEvent) => {
      startEvent.preventDefault();
      setIsDragging(true);

      const startX = startEvent.clientX;
      const startY = startEvent.clientY;
      const startLeftWidth = leftPanelWidth ?? window.innerWidth / 2;
      const startBottomHeight = bottomPanelHeight;
      
      // For input resize, we need to calculate based on the container width
      const inputResizer = startEvent.currentTarget;
      const flexContainer = inputResizer.parentElement as HTMLElement;
      const containerRect = type === "input" && flexContainer ? flexContainer.getBoundingClientRect() : null;

      const handleMouseMove = (e: MouseEvent) => {
        if (type === "vertical") {
          const deltaY = startY - e.clientY;
          const newHeight = startBottomHeight + deltaY;
          // Constraint: keep reasonable space for editor and bottom panel
          if (newHeight >= 100 && newHeight <= window.innerHeight - 150) {
            setBottomPanelHeight(newHeight);
          }
        } else if (type === "horizontal") {
          const deltaX = e.clientX - startX;
          const newWidth = startLeftWidth + deltaX;
          if (newWidth >= 200 && newWidth <= window.innerWidth - 200) {
            setLeftPanelWidth(newWidth);
          }
        } else if (type === "input" && containerRect) {
          const offsetX = e.clientX - containerRect.left;
          const newWidthPercent = (offsetX / containerRect.width) * 100;
          if (newWidthPercent >= 10 && newWidthPercent <= 90) {
            setInputWidth(newWidthPercent);
          }
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "default";
        document.body.style.userSelect = "auto";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = type === "vertical" ? "ns-resize" : "ew-resize";
      document.body.style.userSelect = "none";
    },
    [bottomPanelHeight, leftPanelWidth]
  );

  return (
    <div className="flex w-screen h-screen gap-1 p-2 overflow-hidden text-gray-100 bg-[#1a1a1a]">
      
      {/* --- LEFT PANEL: DESCRIPTION --- */}
      <div
        className="flex flex-col"
        style={{ width: leftPanelWidth !== undefined ? `${leftPanelWidth}px` : "calc(50% - 4px)" }}
      >
        <PanelContainer className="h-full">
          <PanelHeader>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-500"/>
              <span className="text-sm font-medium text-gray-200">Description</span>
            </div>
            <button className="p-1.5 rounded hover:bg-[#444] text-gray-400">
              <Maximize2 size={16} />
            </button>
          </PanelHeader>

          <div className="relative flex-1 overflow-hidden bg-[#262626]">
            <div className={`w-full h-full ${isDragging ? "pointer-events-none" : ""}`}>
              {pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Preview" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm">No PDF loaded</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PanelContainer>
      </div>

      {/* --- HORIZONTAL RESIZER --- */}
      <ResizeHandle 
        direction="horizontal" 
        onMouseDown={(e) => startResizing("horizontal", e)} 
      />

      {/* --- RIGHT PANEL WRAPPER --- */}
      <div className="flex flex-col flex-1 min-w-0 gap-3">
        
        {/* --- TOP: CODE EDITOR --- */}
        <PanelContainer 
          style={{ height: `calc(100vh - ${bottomPanelHeight}px - 24px)` }}
        >
          <PanelHeader>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-green-500">&lt;/&gt; Code</span>
              <div className="h-4 bg-[#4a4a4a]" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-xs font-medium text-gray-200 bg-transparent cursor-pointer focus:outline-none hover:text-white"
              >
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded hover:bg-[#444] text-gray-400">
                <Settings size={14} />
              </button>
              <button className="p-1.5 rounded hover:bg-[#444] text-gray-400">
                <Download size={14} />
              </button>
              <button className="p-1.5 rounded hover:bg-[#444] text-gray-400">
                <Maximize2 size={14} />
              </button>
            </div>
          </PanelHeader>

          <div className="relative flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              theme="vs-dark"
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                padding: { top: 16 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
              }}
            />
          </div>
        </PanelContainer>

        {/* --- VERTICAL RESIZER --- */}
        <ResizeHandle 
          direction="vertical" 
          onMouseDown={(e) => startResizing("vertical", e)} 
        />

        {/* --- BOTTOM: INPUT/OUTPUT --- */}
        <PanelContainer style={{ height: `${bottomPanelHeight}px` }}>
          <PanelHeader>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-2 pb-1 text-sm font-medium text-white border-b-2 border-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Testcase
              </button>
              <button className="flex items-center gap-2 px-2 pb-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-300">
                Test Result
              </button>
            </div>
            <button
              onClick={handleRun}
              className="flex items-center gap-2 bg-[#2cbb5d] hover:bg-[#26a351] text-white px-4 py-1 rounded text-sm font-medium transition-colors"
            >
              <Play size={14} />
              Run
            </button>
          </PanelHeader>

          <div className="flex flex-1 gap-1 p-2 overflow-hidden bg-[#262626]">
            {/* Input Box */}
            <div 
              className="flex flex-col overflow-hidden bg-transparent border border-[#4a4a4a] rounded-md"
              style={{ width: `${inputWidth}%` }}
            >
              <div className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-[#333333] border-b border-[#4a4a4a]">
                Input
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input..."
                className="flex-1 p-3 font-mono text-sm text-gray-300 bg-[#262626] resize-none focus:outline-none placeholder-gray-600"
                spellCheck="false"
              />
            </div>

            {/* Input/Output Resizer */}
            <div
              onMouseDown={(e) => startResizing("input", e)}
              className="w-1 transition-colors rounded cursor-ew-resize hover:bg-blue-950"
              style={{ touchAction: "none" }}
            />

            {/* Output Box */}
            <div 
              className="flex flex-col overflow-hidden bg-transparent border border-[#4a4a4a] rounded-md"
              style={{ width: `calc(${100 - inputWidth}% - 12px)` }}
            >
              <div className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-[#333333] border-b border-[#4a4a4a]">
                Output
              </div>
              <div className="flex-1 p-3 overflow-auto font-mono text-sm text-gray-300 bg-[#262626]">
                {output || (
                  <span className="italic text-gray-600">Run code to see output...</span>
                )}
              </div>
            </div>
          </div>
        </PanelContainer>
      </div>
    </div>
  );
};

export default CodeEditorPage;