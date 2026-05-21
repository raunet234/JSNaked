import jsBeautify from 'js-beautify';

export function beautify(code: string): string {
  try {
    return jsBeautify(code, {
      indent_size: 4,
      indent_char: ' ',
      max_preserve_newlines: 2,
      preserve_newlines: true,
      keep_array_indentation: false,
      break_chained_methods: false,
      brace_style: 'collapse',
      space_before_conditional: true,
      unescape_strings: true,
      jslint_happy: false,
      end_with_newline: true,
      wrap_line_length: 0,
      indent_empty_lines: false,
    });
  } catch {
    return code;
  }
}
