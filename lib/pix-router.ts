// Sistema de roteamento PIX com distribuição 3:1 (UNIPAY:FREEPAY)
interface RouterState {
  unipayCount: number;
  freepayCount: number;
  totalTransactions: number;
  lastReset: string;
}

class PixRouter {
  private state: RouterState = {
    unipayCount: 0,
    freepayCount: 0,
    totalTransactions: 0,
    lastReset: new Date().toISOString()
  };

  // Determina qual API usar baseado na distribuição 3:1
  getNextProvider(): 'unipay' | 'freepay' {
    // A cada 4 transações: 3 UNIPAY + 1 FREEPAY
    const cyclePosition = this.state.totalTransactions % 4;
    
    if (cyclePosition < 3) {
      return 'unipay';
    } else {
      return 'freepay';
    }
  }

  // Registra uma transação e retorna qual API foi usada
  recordTransaction(): 'unipay' | 'freepay' {
    const provider = this.getNextProvider();
    
    this.state.totalTransactions++;
    
    if (provider === 'unipay') {
      this.state.unipayCount++;
    } else {
      this.state.freepayCount++;
    }

    // Log discreto apenas para debugging interno
    console.log(`[Router] #${this.state.totalTransactions} -> ${provider}`);
    
    return provider;
  }

  // Retorna estatísticas atuais
  getStats() {
    return {
      ...this.state,
      ratio: this.state.freepayCount > 0 ? (this.state.unipayCount / this.state.freepayCount).toFixed(2) : 'N/A',
      nextProvider: this.getNextProvider()
    };
  }

  // Reset do contador (opcional, para testes)
  reset() {
    this.state = {
      unipayCount: 0,
      freepayCount: 0,
      totalTransactions: 0,
      lastReset: new Date().toISOString()
    };
    console.log('[Router] Reset');
  }
}

// Instância singleton do router
export const pixRouter = new PixRouter();
