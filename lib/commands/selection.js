'use babel'

import matchingCharCommand from './matchingCharCommand'
import {
  withCount,
  withGoto,
  withoutGoto,
  getMovementCommand,
  getSelectionCommand,
} from './utils'

// selection commands will be triggered for each selection

export default {
  /**
   * @normal move down
   * @shift extend selection down
   */
  j: withoutGoto(withCount(getMovementCommand('Down'))),
  /**
   * @normal move up
   * @shift extend selection up
   */
  k: withCount(getMovementCommand('Up')),
  /**
   * @normal move left
   * @shift extend selection to left
   * @goto go to line begin
   */
  h: withGoto(
    ({ cursor }) => cursor.moveToBeginningOfLine(),
    {},
    withCount(getMovementCommand('Left'))
  ),
  /**
   * @normal move right
   * @shift extend selection to right
   * @goto go to line end
   */
  l: withGoto(
    ({ cursor }) => cursor.moveToEndOfLine(),
    {},
    withCount(getMovementCommand('Right'))
  ),
  /**
   * @goto go to non blank line start
   */
  i: withGoto(({ cursor }) => cursor.moveToFirstCharacterOfLine()),
  /**
   * @normal select to next matching character
   * @shift extend selection to next matching character
   */
  m: matchingCharCommand,
  /**
   * @normal insert at line end
   */
  A: ({ cursor }, { instance }) => {
    cursor.moveToEndOfLine()
    instance.changeModeToInsert()
  },
  /**
   * @normal insert on new line below
   * @difference if used with count, kak would add cursor at beginning of each created line
   */
  o: withCount(({ cursor }, { editor, instance }) => {
    editor.insertNewlineBelow()
    instance.changeModeToInsert()
  }),
  /**
   * @normal insert on new line above
   * @difference if used with count, kak would add cursor at beginning of each created line
   */
  O: withCount(({ cursor }, { editor, instance }) => {
    editor.insertNewlineAbove()
    instance.changeModeToInsert()
  }),
  /**
   * @normal select to next word start
   * @shift extend selection to next word start
   */
  w: withCount(getSelectionCommand('selectToBeginningOfNextWord')),
  /**
   * @normal select to next word end
   * @shift extend selection to next word end
   */
  e: withoutGoto(withCount(getSelectionCommand('selectToEndOfWord'))),
  /**
   * @normal select to previous word start
   * @shift extend selection to previous word start
   */
  b: withoutGoto(
    withCount(getSelectionCommand('selectToPreviousWordBoundary'))
  ),
  /**
   * @normal erase selected text
   */
  d: selection => selection.cut(),
  /**
   * @normal change selected text (erase and enter insert mode)
   */
  c: withoutGoto((selection, { instance }) => {
    selection.cut()
    instance.changeModeToInsert()
  }),
  /**
   * @normal select line
   * @shift extend selection to next line
   */
  x: withCount(getSelectionCommand('selectLine')),
  /**
   * @normal yank selected text
   */
  y: selection => selection.copy(),
  /**
   * @normal erase selected text (or the character before cursor) or modify count
   */
  backspace: (selection, { instance }) => {
    const count = instance.state.count
    if (count) {
      const countString = String(count)
      const updatedCountString = countString.substring(
        0,
        countString.length - 1
      )
      const updatedCount = updatedCountString ? parseInt(updatedCountString) : 0
      instance.updateCount(updatedCount)
    } else {
      if (selection.isEmpty()) {
        selection.selectLeft()
      }
      selection.delete()
    }
  },
}