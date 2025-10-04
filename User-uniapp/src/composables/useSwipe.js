import { ref } from 'vue';

export default function useSwipe() {
  const swipeIndex = ref(-1);// ���������� -1��ʾû�л���
  const startX = ref(0);// ������ʼ��X����
  const currentX = ref(0);// ��ǰ��X����
  const isSwiping = ref(false);// �Ƿ����ڻ���

  // ������ʼ
  function handleTouchStart(e, index) {
    if (swipeIndex.value !== -1 && swipeIndex.value !== index) { // ȷ��ֻ��һ��item�ڻ���
      swipeIndex.value = -1;
    }
    startX.value = e.touches[0].clientX; // ��¼������ʼ��X���� 
    currentX.value = startX.value; // ��ǰX�����ʼ��Ϊ������ʼ��X����
    isSwiping.value = false; // ���û���״̬
  }

  // �����ƶ�
  function handleTouchMove(e, index) {
    if (!e.touches[0]) return; // ȷ���д�����
    currentX.value = e.touches[0].clientX;  // ���µ�ǰX���� 
    const deltaX = currentX.value - startX.value; // ����X��ƫ����
    if (deltaX < -10) {  // ����ֵ
      isSwiping.value = true;
      if (deltaX <= -80) {  // �󻬾�����ֵ
        swipeIndex.value = index;
      }
    } else if (deltaX > 10) {  // �һ���ֵ�����û���״̬
      isSwiping.value = true;
      swipeIndex.value = -1;
    }
  }

  // ��������
  function handleTouchEnd(e, index) {
    if (!isSwiping.value) return;  // ���û�л����򲻴���
    const deltaX = currentX.value - startX.value; // ����X��ƫ����
    if (deltaX <= -80) {  
      swipeIndex.value = index; 
    } else {
      swipeIndex.value = -1;
    }
    isSwiping.value = false;
  }

  // ���û���״̬
  function resetSwipe() {
    swipeIndex.value = -1;
    isSwiping.value = false;
  }

  return {
    swipeIndex,  
    handleTouchStart, 
    handleTouchMove,
    handleTouchEnd,
    resetSwipe
  };
}
