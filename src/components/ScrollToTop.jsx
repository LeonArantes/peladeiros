import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Componente que garante que o scroll seja resetado para o topo
 * sempre que há uma mudança de rota
 */
const ScrollToTop = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Fazer scroll para o topo imediatamente após mudança de rota
    const scrollToTop = () => {
      // Tentar usar scrollTo com behavior instant (mais rápido)
      if (window.scrollTo) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });
      }

      // Fallback para navegadores mais antigos
      if (document.documentElement.scrollTop > 0) {
        document.documentElement.scrollTop = 0;
      }

      if (document.body.scrollTop > 0) {
        document.body.scrollTop = 0;
      }
    };

    // Executar imediatamente
    scrollToTop();

    // Também executar após um pequeno delay para garantir que elementos foram renderizados
    const timeoutId = setTimeout(scrollToTop, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.pathname, location.search, location.hash]); // Incluir search e hash para cobertura completa

  return children;
};

export default ScrollToTop;
