from PIL import Image
from pathlib import Path
root=Path(r'C:/Users/Ayush/.codex/generated_images/01a0a695-ffbf-7781-a133-f8bfd34363a9')
for name,file in [('opening','exec-3bad22a4-1d46-42e5-839c-34f5ff6d4094.png'),('mata','exec-cdd630cb-9a95-424f-b2db-2fcc20576ecf.png'),('vivah','exec-883da6e0-18e6-437c-9915-646924840f7f.png')]:
 Image.open(root/file).save('public/images/'+name+'-bg.webp',quality=87)
