class ReportStrategy {
  generateHeader() {
    return '';
  }

  generateRow() {
    return '';
  }

  generateFooter() {
    return '';
  }
}

class CSVReportStrategy extends ReportStrategy {
  generateHeader() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  generateRow(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }

  generateFooter(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

class HTMLReportStrategy extends ReportStrategy {
  generateHeader(user) {
    return `<html><body>\n<h1>Relatório</h1>\n<h2>Usuário: ${user.name}</h2>\n<table>\n<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n`;
  }

  generateRow(item, user, isPriority = false) {
    const style = isPriority ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  generateFooter(total) {
    return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
  }
}

class ItemFilter {
  static filterByUserRole(items, user) {
    if (user.role === 'ADMIN') {
      return items.map(item => ({
        ...item,
        priority: item.value > 1000
      }));
    }
    
    return items.filter(item => item.value <= 500);
  }
}

export class ReportGenerator {
  constructor(database) {
    this.db = database;
    this.strategies = {
      'CSV': new CSVReportStrategy(),
      'HTML': new HTMLReportStrategy()
    };
  }

  generateReport(reportType, user, items) {
    const strategy = this.strategies[reportType];
    if (!strategy) {
      throw new Error(`Tipo de relatório não suportado: ${reportType}`);
    }

    const filteredItems = ItemFilter.filterByUserRole(items, user);
    let report = strategy.generateHeader(user);
    let total = 0;

    for (const item of filteredItems) {
      report += strategy.generateRow(item, user, item.priority);
      total += item.value;
    }

    report += strategy.generateFooter(total);
    return report.trim();
  }
}