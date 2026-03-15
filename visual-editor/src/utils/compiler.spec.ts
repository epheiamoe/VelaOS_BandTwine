import { describe, it, expect } from 'vitest'
import { compileText, previewText } from './compiler'

describe('compiler', () => {
  describe('compileText', () => {
    it('returns empty array for empty text', () => {
      expect(compileText('', 'test')).toEqual([])
    })

    it('returns text segment for whitespace-only text', () => {
      const result = compileText('   ', 'test')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ type: 'text', content: '   ' })
    })

    it('parses plain text', () => {
      const result = compileText('Hello world', 'n1')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        type: 'text',
        content: 'Hello world'
      })
    })

    it('parses newline', () => {
      const result = compileText('Hello\nworld', 'n1')
      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({ type: 'text', content: 'Hello' })
      expect(result[1]).toMatchObject({ type: 'newline' })
      expect(result[2]).toMatchObject({ type: 'text', content: 'world' })
    })

    it('parses variable marker', () => {
      const result = compileText('Time: {var.world.time}', 'n1')
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({ type: 'text', content: 'Time: ' })
      expect(result[1]).toMatchObject({ type: 'variable', path: 'world.time' })
    })

    it('parses condition marker', () => {
      const result = compileText('{cond.visited}', 'n1')
      expect(result[0]).toMatchObject({ type: 'condition', id: 'visited' })
    })

    it('parses random marker', () => {
      const result = compileText('{random.greeting}', 'n1')
      expect(result[0]).toMatchObject({ type: 'random', id: 'greeting' })
    })

    it('parses image marker', () => {
      const result = compileText('{img.background}', 'n1')
      expect(result[0]).toMatchObject({ type: 'image', id: 'background' })
    })

    it('parses expression', () => {
      const result = compileText('$(player.name)', 'n1')
      expect(result[0]).toMatchObject({ type: 'expression', code: 'player.name' })
    })

    it('parses link index', () => {
      const result = compileText('Choose {1}', 'n1')
      expect(result[0]).toMatchObject({ type: 'text', content: 'Choose ' })
      expect(result[1]).toMatchObject({ type: 'link', index: 1 })
    })

    it('generates unique tid', () => {
      const result = compileText('Hello {var.x} world', 'n1')
      expect(result[1]?.tid).toBe('n1-variable-1')
    })
  })

  describe('previewText', () => {
    it('replaces variable markers with values', () => {
      const variables = {
        world: {
          time: '12:00'
        }
      }
      expect(previewText('Time: {var.world.time}', variables)).toBe('Time: 12:00')
    })

    it('handles nested variables', () => {
      const variables = {
        player: {
          stats: {
            health: 100
          }
        }
      }
      expect(previewText('Health: {var.player.stats.health}', variables)).toBe('Health: 100')
    })

    it('keeps original marker if variable not found', () => {
      expect(previewText('{var.unknown}', {})).toBe('{var.unknown}')
    })

    it('replaces condition markers', () => {
      expect(previewText('{cond.visited}', {})).toBe('[条件 visited]')
    })

    it('replaces random markers', () => {
      expect(previewText('{random.greeting}', {})).toBe('[随机 greeting]')
    })

    it('replaces image markers', () => {
      expect(previewText('{img.background}', {})).toBe('[图片 background]')
    })

    it('replaces expressions', () => {
      expect(previewText('$(player.name)', {})).toBe('[表达式 player.name]')
    })

    it('replaces link indices', () => {
      expect(previewText('Choose {1}', {})).toBe('Choose [链接 1]')
    })
  })
})