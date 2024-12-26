const clients = new Map();
const chunkMap = new Map();

function getChunkIndex(position) {
    const x = position.x % 16;
    const y = position.y % 256;
    const z = position.z % 16;
    return x + y * 16*16 + z * 16;
}

function getRandomSurfacePosition() {
    const chunkWidth = 16;
    const chunkDepth = 16;

    // Генерируем случайные координаты чанка
    const randomX = Math.floor(Math.random() * chunkWidth);
    const randomZ = Math.floor(Math.random() * chunkDepth);

    // Определяем ключ чанка по координатам
    const chunkKey = `${Math.floor(randomX / chunkWidth)},${Math.floor(randomZ / chunkDepth)}`;

    let chunk;

    // Проверяем, существует ли чанк
    if (chunkMap.has(chunkKey)) {
        chunk = chunkMap.get(chunkKey);
    } else {
        // Если чанка нет, создаем новый чанк
        chunk = createChunk(); // Ваша функция создания чанка
        chunkMap.set(chunkKey, chunk); // Сохраняем новый чанк в карте
    }

    // Получаем поверхность по случайным координатам в чанке
    const surfaceY = findSurfaceHeight(chunk, randomX % chunkWidth, randomZ % chunkDepth);

    return { x: randomX, y: surfaceY+2, z: randomZ }; // Возвращаем поверхность
}

// Функция для создания чанка (пример)
function createChunk() {
    const width = 16;
    const height = 256;
    const depth = 16;
    // Создаем чанк, например, заполняя его блоками земли (1) и воздухом (0)
    const chunk = new Array(width * height * depth).fill(0); // Начинаем с блока воздуха (0)

    // Например, заполним уровни до десяти единиц (земли)
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < depth; j++) {
            for (let k = 0; k < 10; k++) {
                chunk[getChunkIndex({x: i, y: k, z: j})] = 1; // Земля
            }
        }
    }

    return chunk; // Возвращаем новый созданный чанк
}

function findSurfaceHeight(chunk, x, z) {
    const height = 256; // Максимальная высота
    for (let y = height - 1; y >= 0; y--) { // Начинаем с самой верхней высоты и идем вниз
        const index = getChunkIndex({ x: x, y: y, z: z });
        if (chunk[index] !== 0) { // Предполагаем, что 0 - это воздух
            return y; // Возвращаем Y-координату найденной поверхности
        }
    }
    // Если не найдено, возвращаем 0 (уровень моря)
    return 0;
}

module.exports = {
    clients,
    chunkMap,
    createChunk,
    getChunkIndex,
    getRandomSurfacePosition,
    findSurfaceHeight,
};
