const BASE_URL = 'http://172.20.10.5:8000';

export const analyzeEgg = async (imageUri: string, context: any) => {
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    name: 'egg.jpg',
    type: 'image/jpeg',
  } as any);

  formData.append('context', JSON.stringify(context));

  const response = await fetch(`${BASE_URL}/egg/analyze`, {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};

export const finalizeDecision = async (data: any) => {
  const response = await fetch(`${BASE_URL}/egg/finalize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return await response.json();
};