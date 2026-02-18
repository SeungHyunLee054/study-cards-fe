import type { CategoryResponse } from '@/types/category'

export interface CategoryTreeNode {
  id: number
  code: string
  name: string
  parentCode: string | null
  depth: number
  children: CategoryTreeNode[]
}

export interface CategoryTreeOption {
  id: number
  code: string
  name: string
  depth: number
  label: string
  pathLabel: string
}

interface InternalNode {
  id: number
  code: string
  name: string
  parentCode: string | null
  order: number
  children: InternalNode[]
}

function toTreeNode(node: InternalNode, depth: number): CategoryTreeNode {
  return {
    id: node.id,
    code: node.code,
    name: node.name,
    parentCode: node.parentCode,
    depth,
    children: node.children
      .sort((a, b) => a.order - b.order)
      .map((child) => toTreeNode(child, depth + 1)),
  }
}

export function buildCategoryTreeFromFlat(categories: CategoryResponse[]): CategoryTreeNode[] {
  if (categories.length === 0) return []

  const nodeMap = new Map<string, InternalNode>()
  const roots: InternalNode[] = []

  categories.forEach((category, index) => {
    nodeMap.set(category.code, {
      id: category.id,
      code: category.code,
      name: category.name,
      parentCode: category.parentCode,
      order: index,
      children: [],
    })
  })

  nodeMap.forEach((node) => {
    if (!node.parentCode) {
      roots.push(node)
      return
    }

    const parent = nodeMap.get(node.parentCode)
    if (!parent || parent.code === node.code) {
      roots.push(node)
      return
    }

    parent.children.push(node)
  })

  return roots
    .sort((a, b) => a.order - b.order)
    .map((root) => toTreeNode(root, 0))
}

function flattenTreeOptions(tree: CategoryTreeNode[], leafOnly: boolean): CategoryTreeOption[] {
  const options: CategoryTreeOption[] = []

  function walk(node: CategoryTreeNode, ancestors: string[]) {
    const nextAncestors = [...ancestors, node.name]
    const prefix = node.depth > 0 ? `${'  '.repeat(node.depth)}└ ` : ''

    const isLeaf = node.children.length === 0
    if (!leafOnly || isLeaf) {
      options.push({
        id: node.id,
        code: node.code,
        name: node.name,
        depth: node.depth,
        label: `${prefix}${node.name}`,
        pathLabel: nextAncestors.join(' > '),
      })
    }

    node.children.forEach((child) => walk(child, nextAncestors))
  }

  tree.forEach((root) => walk(root, []))
  return options
}

export function flattenCategoryTreeForSelect(tree: CategoryTreeNode[]): CategoryTreeOption[] {
  return flattenTreeOptions(tree, false)
}

export function flattenLeafCategoryTreeForSelect(tree: CategoryTreeNode[]): CategoryTreeOption[] {
  return flattenTreeOptions(tree, true)
}

export function flattenCategoriesForSelect(categories: CategoryResponse[]): CategoryTreeOption[] {
  return flattenCategoryTreeForSelect(buildCategoryTreeFromFlat(categories))
}

export function flattenLeafCategoriesForSelect(categories: CategoryResponse[]): CategoryTreeOption[] {
  return flattenLeafCategoryTreeForSelect(buildCategoryTreeFromFlat(categories))
}
