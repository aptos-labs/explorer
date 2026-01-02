import {
  createStartHandler,
  defaultRenderHandler,
} from "@tanstack/react-start/server";

// Use defaultRenderHandler instead of defaultStreamHandler because:
// - defaultRenderHandler uses renderRouterToString which includes <!DOCTYPE html>
// - defaultStreamHandler uses renderRouterToStream which does NOT include DOCTYPE
// This prevents Quirks Mode issues
export default createStartHandler(defaultRenderHandler);
