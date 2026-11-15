# Pruebas de Performance con JMeter

Este directorio contiene el plan de pruebas de performance para el backend de ElectroShop.

## Escenario de Prueba
- **Usuarios Concurrentes**: 4
- **Endpoint**: GET /api/products
- **Duración**: 5 iteraciones por usuario (20 peticiones total)
- **Criterio de Aceptación**: Tiempo de respuesta < 2 segundos

## Archivos
- `load-test.jmx`: Archivo del plan de pruebas de JMeter.
- `results.jtl`: Archivo de resultados de la última ejecución.
- `report/`: Reporte HTML generado automáticamente.

## Cómo ejecutar las pruebas

### Requisitos
- Tener instalado Apache JMeter y configurado en el PATH del sistema.
- El backend debe estar corriendo en `http://localhost:3000`.

### Comando
Ejecutar el siguiente comando desde la raíz del proyecto:

```bash
jmeter -n -t tests/performance-test/load-test.jmx -l tests/performance-test/results.jtl -e -o tests/performance-test/report
```

Nota: Si la carpeta `report` ya existe, debe eliminarla antes de ejecutar el comando.

## Resultados Esperados
Se espera que el tiempo de respuesta promedio sea menor a 200ms y el máximo no supere los 2000ms (2 segundos).
