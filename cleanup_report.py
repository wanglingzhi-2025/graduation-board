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

def analyze_duplicates(directory):
    """分析重复文件"""
    duplicates = defaultdict(list)
    all_files = []
    
    print(f"正在扫描目录: {directory}\n")
    
    # 获取所有文件
    try:
        items = os.listdir(directory)
        print(f"找到 {len(items)} 个项目\n")
    except Exception as e:
        print(f"错误: 无法读取目录 - {e}")
        return
    
    for item in items:
        full_path = os.path.join(directory, item)
        if os.path.isfile(full_path):
            all_files.append(item)
            
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
    
    print(f"总文件数: {len(all_files)}")
    print(f"发现 {len(duplicates)} 组重复文件\n")
    print("=" * 80)
    
    # 统计
    total_to_delete = 0
    report_lines = []
    
    for original_name, dup_list in sorted(duplicates.items()):
        original_path = os.path.join(directory, original_name)
        original_exists = os.path.exists(original_path)
        
        report_lines.append(f"\n原始文件: {original_name}")
        report_lines.append(f"  状态: {'✓ 存在' if original_exists else '✗ 不存在'}")
        report_lines.append(f"  重复文件数: {len(dup_list)}")
        
        # 排序重复文件
        dup_list.sort(key=lambda x: x['number'])
        
        if not original_exists and dup_list:
            # 如果原始文件不存在，保留编号最小的
            keep = dup_list[0]
            report_lines.append(f"  → 将保留: {keep['name']} (作为原始文件)")
            dup_list = dup_list[1:]
        
        for dup in dup_list:
            report_lines.append(f"  - 将删除: {dup['name']}")
            total_to_delete += 1
    
    # 输出报告
    for line in report_lines:
        print(line)
    
    print("\n" + "=" * 80)
    print(f"\n摘要:")
    print(f"  总文件数: {len(all_files)}")
    print(f"  重复文件组数: {len(duplicates)}")
    print(f"  将删除的文件数: {total_to_delete}")
    print(f"  删除后剩余: {len(all_files) - total_to_delete}")
    
    # 保存到文件
    report_file = "duplicate_files_report.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(f"重复文件分析报告\n")
        f.write(f"扫描目录: {directory}\n")
        f.write(f"扫描时间: {__import__('datetime').datetime.now()}\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"总文件数: {len(all_files)}\n")
        f.write(f"重复文件组数: {len(duplicates)}\n")
        f.write(f"将删除的文件数: {total_to_delete}\n\n")
        f.write("=" * 80 + "\n")
        for line in report_lines:
            f.write(line + "\n")
    
    print(f"\n详细报告已保存到: {report_file}")
    
    return total_to_delete

if __name__ == "__main__":
    downloads_dir = r"C:\Users\ZZ09H7672\Downloads"
    analyze_duplicates(downloads_dir)

# Made with Bob
