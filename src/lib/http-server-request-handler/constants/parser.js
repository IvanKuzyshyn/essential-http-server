export const REQUEST_START_LINE_REGEXP = new RegExp('(GET|HEAD|POST|PUT|DELETE|CONNECT|OPTIONS|TRACE|PATCH)\\s([\\.a-zA-Z0-9\\w\\/-]+)\\s([\\.A-Z\\/\\d]+)');
export const REQUEST_HEADER_REGEXP = new RegExp('([\\w-]+):\\s(.+)');
