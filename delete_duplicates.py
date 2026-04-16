# -*- coding: utf-8 -*-
import os
import re
import sys
from collections import defaultdict

# 设置环境变量强制使用 UTF-8
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

def delete_duplicates(directory, exclude_patterns=None):
    """
    删除重复文件，保留原始文件
    exclude_patterns: 要排除的文件名模式列表
    """
    if exclude_patterns is None:
        exclude_patterns = []
    
    duplicates = defaultdict(list)
    
    print(f"正在扫描目录: {directory}\n")
    
    # 获取所有文件
    try:
        items = os.listdir(directory)
    except Exception as e:
        print(f"错误: 无法读取目录 - {e}")
        return
    
    for item in items:
        full_path = os.path.join(directory, item)
        if os.path.isfile(full_path):
            # 匹配文件名模式: filename (1).ext, filename (2).ext 等
            match = re.match(r'^(.+?)\s*\((\d+)\)(\.[^.]+)?$', item)
            
            if match:
                base_name = match.group(1)
                number = int(match.group(2))
                extension = match.group(3) if match.group(3) else ''
                original_name = base_name + extension
                
                duplicates[original_name].append({
                    'name': item,
                    'number': number,
                    'path': full_path
                })
    
    print(f"发现 {len(duplicates)} 组重复文件\n")
    print("=" * 80)
    
    # 统计
    total_deleted = 0
    total_skipped = 0
    total_errors = 0
    deleted_files = []
    skipped_files = []
    errors = []
    
    for original_name, dup_list in sorted(duplicates.items()):
        # 检查是否在排除列表中
        should_exclude = False
        for pattern in exclude_patterns:
            if pattern in original_name:
                should_exclude = True
                break
        
        if should_exclude:
            print(f"\n⊘ 跳过 (排除): {original_name}")
            print(f"  重复文件数: {len(dup_list)}")
            for dup in dup_list:
                print(f"  - 保留: {dup['name']}")
                skipped_files.append(dup['name'])
                total_skipped += 1
            continue
        
        original_path = os.path.join(directory, original_name)
        original_exists = os.path.exists(original_path)
        
        print(f"\n原始文件: {original_name}")
        print(f"  状态: {'✓ 存在' if original_exists else '✗ 不存在'}")
        print(f"  重复文件数: {len(dup_list)}")
        
        # 排序重复文件
        dup_list.sort(key=lambda x: x['number'])
        
        if not original_exists and dup_list:
            # 如果原始文件不存在，保留编号最小的
            keep = dup_list[0]
            print(f"  → 保留: {keep['name']} (作为原始文件)")
            dup_list = dup_list[1:]
        
        # 删除其他重复文件
        for dup in dup_list:
            try:
                os.remove(dup['path'])
                print(f"  ✓ 已删除: {dup['name']}")
                deleted_files.append(dup['name'])
                total_deleted += 1
            except Exception as e:
                error_msg = f"删除失败 {dup['name']}: {str(e)}"
                print(f"  ✗ {error_msg}")
                errors.append(error_msg)
                total_errors += 1
    
    # 打印摘要
    print("\n" + "=" * 80)
    print("\n最终摘要:")
    print(f"  成功删除: {total_deleted} 个文件")
    print(f"  跳过保留: {total_skipped} 个文件")
    if total_errors > 0:
        print(f"  删除失败: {total_errors} 个文件")
    print("=" * 80)
    
    # 保存删除日志
    log_file = "deletion_log.txt"
    with open(log_file, 'w', encoding='utf-8') as f:
        f.write(f"重复文件删除日志\n")
        f.write(f"删除时间: {__import__('datetime').datetime.now()}\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"成功删除: {total_deleted} 个文件\n")
        f.write(f"跳过保留: {total_skipped} 个文件\n")
        f.write(f"删除失败: {total_errors} 个文件\n\n")
        
        if deleted_files:
            f.write("=" * 80 + "\n")
            f.write("已删除的文件:\n")
            f.write("=" * 80 + "\n")
            for file in deleted_files:
                f.write(f"  - {file}\n")
        
        if skipped_files:
            f.write("\n" + "=" * 80 + "\n")
            f.write("跳过的文件 (排除规则):\n")
            f.write("=" * 80 + "\n")
            for file in skipped_files:
                f.write(f"  - {file}\n")
        
        if errors:
            f.write("\n" + "=" * 80 + "\n")
            f.write("错误:\n")
            f.write("=" * 80 + "\n")
            for error in errors:
                f.write(f"  - {error}\n")
    
    print(f"\n删除日志已保存到: {log_file}")
    
    return {
        'deleted': total_deleted,
        'skipped': total_skipped,
        'errors': total_errors
    }

if __name__ == "__main__":
    downloads_dir = r"C:\Users\ZZ09H7672\Downloads"
    
    # 排除 image.png 相关文件
    exclude_patterns = ['image.png']
    
    print("=" * 80)
    print("⚠ 警告: 即将删除重复文件!")
    print("=" * 80)
    print(f"\n排除规则: 不删除包含以下模式的文件:")
    for pattern in exclude_patterns:
        print(f"  - {pattern}")
    print()
    
    response = input("确认要删除重复文件吗? (输入 'yes' 确认): ")
    if response.lower() != 'yes':
        print("\n操作已取消")
        sys.exit(0)
    
    print("\n开始删除...\n")
    result = delete_duplicates(downloads_dir, exclude_patterns=exclude_patterns)

# Made with Bob
