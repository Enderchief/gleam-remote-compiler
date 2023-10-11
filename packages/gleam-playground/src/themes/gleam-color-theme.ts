/**
 * Copyright (c) 2023 trag1c
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { IRawTheme } from "vscode-textmate";

export default {
  name: 'Gleam Theme',
  settings: [
    {
      settings: {
        foreground: '#ffffffd8',
        background: '#1e1e1e',
      },
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: '#808080',
      },
    },
    {
      scope: ['string'],
      settings: {
        foreground: '#c8ffa7',
      },
    },
    {
      scope: ['storage.type.function.arrow'],
      settings: {
        foreground: '#FFFFFFD8',
      },
    },
    {
      scope: [
        'storage.type',
        'storage.modifier',
        'keyword',
        'variable.language.this',
        'variable.language.super',
        'keyword.other.typedef',
        'constant.language',
      ],
      settings: {
        foreground: '#FE7AB2',
      },
    },
    {
      scope: ['entity.name.type.class'],
      settings: {
        foreground: '#ffddfa',
      },
    },
    {
      scope: ['variable.other.property', 'variable.other.object.property'],
      settings: {
        foreground: '#B181EC',
      },
    },
    {
      scope: [
        'entity.name.function',
        'entity.name.function.method',
        'support.function',
        'support.constant.handlebars',
        'source.powershell variable.other.member',
        'entity.name.operator.custom-literal',
      ],
      settings: {
        foreground: '#9ce7ff',
      },
    },
    {
      scope: [
        'entity.name.type.module',
        'entity.other.inherited-class',
        'entity.name.class',
      ],
      settings: {
        foreground: '#ffddfa',
      },
    },
    {
      scope: ['markup.bold', 'markdown.bold'],
      settings: {
        foreground: '#ffddfa',
        fontStyle: '',
      },
    },
    {
      scope: ['markup.heading', 'markdown.heading'],
      settings: {
        foreground: '#ffddfa',
        fontStyle: '',
      },
    },
    {
      scope: ['markup.italic', 'markdown.italic'],
      settings: {
        foreground: '#D9BAFF',
        fontStyle: '',
      },
    },
    {
      scope: ['markup.quote', 'markdown.quote'],
      settings: {
        foreground: '#D9BAFF',
        fontStyle: '',
      },
    },
    {
      scope: ['meta.type.annotation'],
      settings: {
        foreground: '#ffddfa',
      },
    },
    {
      scope: [
        'punctuation.definition.tag',
        'entity.name.tag',
        'punctuation.separator.key-value',
      ],
      settings: {
        foreground: '#FE7AB2',
      },
    },
    {
      scope: ['punctuation.separator.key-value.js'],
      settings: {
        foreground: '#FFFFFFD9',
      },
    },
    {
      scope: ['meta.attribute', 'entity.other.attribute-name'],
      settings: {
        foreground: '#E0E0E0',
      },
    },
    {
      scope: ['constant.numeric'],
      settings: {
        foreground: '#fdffab',
      },
    },
    {
      scope: ['variable.other.property'],
      settings: {
        foreground: '#9ce7ff',
      },
    },
    {
      scope: ['keyword.operator'],
      settings: {
        foreground: '#ffaff3D9',
      },
    },
    {
      scope: ['variable.parameter'],
      settings: {
        foreground: '#FFFFFFD9',
      },
    },
    {
      scope: ['support.type'],
      settings: {
        foreground: '#D9BAFF',
      },
    },
    {
      scope: ['keyword.operator.assignment'],
      settings: {
        foreground: '#ffaff3D9',
      },
    },
    {
      scope: ['entity.name.fragment.graphql', 'variable.fragment.graphql'],
      settings: {
        foreground: '#ffddfa',
      },
    },
    {
      scope: ['punctuation.quasi.element'],
      settings: {
        foreground: '#FFFFFFD9',
      },
    },
    {
      scope: ['variable.other.readwrite'],
      settings: {
        foreground: '#FFFFFFD9',
      },
    },
    {
      scope: ['meta.brace'],
      settings: {
        foreground: '#FFFFFFD9',
      },
    },
    {
      scope: ['keyword.operator.arithmetic'],
      settings: {
        foreground: '#FFAFF3',
      },
    },
    {
      scope: 'token.info-token',
      settings: {
        foreground: '#6796E6',
      },
    },
    {
      scope: 'token.warn-token',
      settings: {
        foreground: '#CD9731',
      },
    },
    {
      scope: 'token.error-token',
      settings: {
        foreground: '#F44747',
      },
    },
    {
      scope: 'token.debug-token',
      settings: {
        foreground: '#B267E6',
      },
    },
    {
      scope: 'comment',
      settings: {
        foreground: '#808080',
      },
    },
    {
      scope: 'punctuation.definition.comment',
      settings: {
        foreground: '#808080',
      },
    },
    {
      scope: 'string',
      settings: {
        foreground: '#C8FFA7',
      },
    },
    {
      scope: 'meta.embedded.assembly',
      settings: {
        foreground: '#C8FFA7',
      },
    },
    {
      scope: 'keyword - keyword.operator',
      settings: {
        foreground: '#FFAFF3',
      },
    },
    {
      scope: 'keyword.control',
      settings: {
        foreground: '#FFD596',
      },
    },
    {
      scope: 'storage',
      settings: {
        foreground: '#FFD596',
      },
    },
    {
      scope: 'storage.type',
      settings: {
        foreground: '#FFD596',
      },
    },
    {
      scope: 'constant.numeric',
      settings: {
        foreground: '#FDFFAB',
      },
    },
    {
      scope: 'entity.name.type',
      settings: {
        foreground: '#FFDDFA',
      },
    },
    {
      scope: 'entity.name.class',
      settings: {
        foreground: '#FFDDFA',
      },
    },
    {
      scope: 'support.type',
      settings: {
        foreground: '#FFDDFA',
      },
    },
    {
      scope: 'support.class',
      settings: {
        foreground: '#FFDDFA',
      },
    },
    {
      scope: 'entity.name.function',
      settings: {
        foreground: '#9CE7FF',
      },
    },
    {
      scope: 'support.function',
      settings: {
        foreground: '#9CE7FF',
      },
    },
    {
      scope: 'keyword.operator',
      settings: {
        foreground: '#FFAFF3',
      },
    },
    {
      scope: 'keyword.operator.arithmetic',
      settings: {
        foreground: '#FFAFF3',
      },
    },
    {
      scope: 'meta.attribute',
      settings: {
        foreground: '#E0E0E0',
      },
    },
  ],
} satisfies IRawTheme;
