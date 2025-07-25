import { extendTheme } from "@chakra-ui/react";

const colors = {
  primary: {
    50: "#f7f7f7",
    100: "#e3e3e3",
    200: "#c8c8c8",
    300: "#a4a4a4",
    400: "#818181",
    500: "#666666",
    600: "#515151",
    700: "#434343",
    800: "#383838",
    900: "#272727", // Primary color
  },
  gray: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
  },
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: "12px",
      fontWeight: "medium",
    },
    variants: {
      solid: {
        bg: "primary.900",
        color: "white",
        _hover: {
          bg: "primary.800",
        },
        _active: {
          bg: "primary.800",
        },
      },
    },
    defaultProps: {
      variant: "solid",
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: "16px",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        border: "1px solid",
        borderColor: "gray.200",
      },
    },
  },
  Heading: {
    baseStyle: {
      color: "primary.900",
    },
  },
};

const breakpoints = {
  base: "0px",
  sm: "480px",
  md: "768px",
  lg: "992px",
  xl: "1280px",
  "2xl": "1536px",
};

const space = {
  xs: "0.5rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem",
  "2xl": "4rem",
};

const theme = extendTheme({
  colors,
  components,
  breakpoints,
  space,
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
    },
  },
  radii: {
    none: "0",
    sm: "4px",
    base: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
    full: "9999px",
  },
});

export default theme;
