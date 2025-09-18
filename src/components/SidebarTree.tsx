import React from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

interface SidebarTreeProps {
  selectedPath: string;
  onPathChange: (path: string) => void;
  seriesCount?: number;
  soundsCount?: number;
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isSelectable?: boolean;
  isDynamic?: boolean;
}

export default function SidebarTree({
  selectedPath,
  onPathChange,
  seriesCount = 0,
  soundsCount = 0,
}: SidebarTreeProps) {
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set(['series', 'sounds']));

  // Добавили пункт Home (Featured) с id = "home"
  const treeStructure: TreeNode[] = [
    { id: 'site', label: 'Site', isSelectable: true },
    { id: 'home', label: 'Home (Featured)', isSelectable: true }, // ← НОВОЕ
    { id: 'nav', label: 'Navigation', isSelectable: true },
    {
      id: 'series',
      label: `Series (${seriesCount})`,
      isSelectable: true,
      isDynamic: true,
    },
    {
      id: 'sounds',
      label: `Sounds (${soundsCount})`,
      isSelectable: true,
      isDynamic: true,
    },
    { id: 'statement', label: 'Statement', isSelectable: true },
    { id: 'contacts', label: 'Contacts', isSelectable: true },
    { id: 'impressum', label: 'Impressum', isSelectable: true },
    { id: 'footer', label: 'Footer', isSelectable: true },
  ];

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedPath === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onPathChange(node.id)}
        >
          <File size={16} className="mr-3 text-gray-400" />
          <span className="font-medium">{node.label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="py-4">
      <div className="px-4 mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Content Structure</h2>
      </div>
      {treeStructure.map((node) => renderNode(node))}
    </div>
  );
}
