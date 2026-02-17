---
theme: default
addons:
  - subtitle
---

<div class="flex items-center justify-center h-full">
  <h1 class="text-6xl font-bold">slidev-addon-subtitle</h1>
</div>

<!--
안녕하세요, 오늘은 제가 만든 slidev-addon-subtitle이라는 라이브러리를 소개하려고 합니다.
이 애드온은 Slidev 프레젠테이션에 자막을 자동으로 추가해주는 도구입니다.
-->

---

<div class="flex items-center justify-center h-full">
  <span class="text-9xl font-bold">?</span>
</div>

<!--
발표 슬라이드에 글을 많이 적지 말라는 이야기, 다들 한 번쯤 들어보셨을 겁니다.
저도 동의합니다. 슬라이드는 깔끔할수록 좋죠.
하지만 발표가 끝난 뒤 슬라이드를 공유하면, 보는 사람 입장에서는 정보가 너무 적어서 맥락을 이해하기 어렵습니다.
발표자의 설명 없이 슬라이드만 봐서는 무슨 이야기를 했는지 알 수가 없는 거죠.
-->

---

<div class="flex items-center justify-center h-full">
  <span class="text-5xl font-bold font-mono">sublee/subpptx</span>
</div>

<!--
저는 개인적으로 예전에 듀랑고 NDC 발표를 재밌게 봤었는데요, 그 발표 자료들에는 예전에 sublee님이 만드신 subpptx라는 도구로 자막이 모두 달려있었습니다.
자막이 있으니 마치 발표를 직접 듣는 것 같은 느낌이었어요.
Slidev에도 이런 기능이 있으면 좋겠다는 생각이 들어서, 만들어 보게 되었습니다.
-->

---

# 어떻게 동작하나요?

```md {all|5}
<!--
이 애드온의 핵심은, 자막을 따로 작성할 필요가 없다는 점입니다.
여러분이 평소처럼 presenter note를 작성하면, 그것이 곧 자막이 됩니다.
줄바꿈으로 자막을 나눌 수 있고, PDF로 내보낼 때 각 줄이 별도 페이지가 됩니다.
[click]
그리고 click 마커를 활용하면, 클릭할 때마다 해당하는 자막이 표시됩니다.
슬라이드의 각 단계에 맞는 자막만 보여주는 거죠.
-->
```

<!--
이 애드온의 핵심은, 자막을 따로 작성할 필요가 없다는 점입니다.
여러분이 평소처럼 presenter note를 작성하면, 그것이 곧 자막이 됩니다.
줄바꿈으로 자막을 나눌 수 있고, PDF로 내보낼 때 각 줄이 별도 페이지가 됩니다.
[click]
그리고 click 마커를 활용하면, 클릭할 때마다 해당하는 자막이 표시됩니다.
슬라이드의 각 단계에 맞는 자막만 보여주는 거죠.
-->
