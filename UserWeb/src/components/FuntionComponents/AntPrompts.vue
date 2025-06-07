<template>
    <div>
            <Prompts
                title="✨例如你可以问下面问题："
                :items="items"
                wrap 
                vertical
            />
    </div>
</template>

<script setup>  
import { Prompts } from 'ant-design-x-vue'

const items = [
  {
    key: '1',
    label: 'Ignite Your Creativity',
    description: 'Got any sparks for a new project?',
  },
  {
    key: '2',
    label: 'Uncover Background Info',
    description: 'Help me understand the background of this topic.',
  },
  {
    key: '3',
    label: 'Efficiency Boost Battle',
    description: 'How can I work faster and better?',
  },
]


</script>