import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeToggle from '../ThemeToggle.vue'

describe('ThemeToggle', () => {
  beforeEach(() => {
    // 重置 DOM
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders correctly', () => {
    const _wrapper = mount(ThemeToggle)
    
    expect(_wrapper.find('button').exists()).toBe(true)
    expect(_wrapper.find('svg').exists()).toBe(true)
  })

  it('toggles theme on click', async () => {
    const _wrapper = mount(ThemeToggle)
    const button = _wrapper.find('button')
    
    // 初始应为 light 主题
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    
    // 点击切换
    await button.trigger('click')
    
    // 应该切换为 dark 主题
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    
    // 再次点击
    await button.trigger('click')
    
    // 应该切换回 light 主题
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('respects system dark mode preference', () => {
    // 模拟 prefers-color-scheme: dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    
    mount(ThemeToggle)
    
    // 应该设置为 dark 主题
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})